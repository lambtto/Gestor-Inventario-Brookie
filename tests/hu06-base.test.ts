import { describe, it, expect } from 'vitest';
import { abrirBase, aplicarMigraciones } from '../src/db/conexion.js';
import { aplicarEventoInsumo, alertasDeInsumo, obtenerInsumo, obtenerInsumoPorNombre } from '../src/dominio/insumo.js';
import { obtenerProductoPorNombre, obtenerReceta, reemplazarReceta } from '../src/dominio/receta.js';

describe('Base de datos (HU-06)', () => {
  it('aplicar las migraciones dos veces no las duplica', () => {
    const db = abrirBase();
    aplicarMigraciones(db);
    const filas = db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get() as { n: number };
    expect(filas.n).toBe(6); // 001 (HU-06), 002 (costo CLP), 003 (café en grano), 004 (HU-07, Ajuste), 005 (HU-01, Venta) y 006 (Eval. 2, Venta.estado)
  });

  it('crea las tablas del modelo de dominio y rechaza un ingrediente con cantidad 0', () => {
    const db = abrirBase();
    const tablas = (db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all() as { name: string }[]).map(
      (t) => t.name,
    );
    for (const t of ['insumos', 'productos', 'recetas', 'ingredientes', 'alertas_stock', 'pedidos', 'movimientos_inventario']) {
      expect(tablas).toContain(t);
    }
    db.prepare("INSERT INTO insumos (nombre, unidad_medida, costo_unitario, stock_minimo) VALUES ('leche','ml',1,0)").run();
    db.prepare("INSERT INTO productos (nombre) VALUES ('Café Latte')").run();
    db.prepare('INSERT INTO recetas (producto_id, rendimiento) VALUES (1, 1)').run();
    expect(() => db.prepare('INSERT INTO ingredientes (receta_id, insumo_id, cantidad) VALUES (1, 1, 0)').run()).toThrow();
  });

  it("ajuste HU-06 · la migración 002 redondea al entero los costos ya guardados (CLP)", () => {
    const db = abrirBase();
    // Simula una base anterior al ajuste: 002 aún no aplicada y costos con decimales
    db.prepare("DELETE FROM schema_migrations WHERE nombre LIKE ?").run("002_%");
    const ins = db.prepare("INSERT INTO insumos (nombre, unidad_medida, costo_unitario, stock_minimo) VALUES (?, ?, ?, 0)");
    ins.run("azúcar blanca", "g", 1.5);
    ins.run("agua fría", "g", 0.01);
    ins.run("vainilla", "cucharadita", 150);
    aplicarMigraciones(db);
    const costos = db.prepare("SELECT nombre, costo_unitario AS c FROM insumos ORDER BY nombre").all();
    expect(costos).toEqual([
      { nombre: "agua fría", c: 0 },
      { nombre: "azúcar blanca", c: 2 },
      { nombre: "vainilla", c: 150 },
    ]);
  });

  /** Simula una base creada antes del ajuste del café en grano: 003 sin aplicar y «espresso doble» en recetas. */
  function baseConEspresso(conMovimiento = false) {
    const db = abrirBase();
    db.prepare("DELETE FROM schema_migrations WHERE nombre LIKE ?").run("003_%");
    const espresso = aplicarEventoInsumo(db, { tipo: "registrar", datos: { nombre: "espresso doble", unidadMedida: "espresso doble", costoUnitario: 400, stockMinimo: 20 } });
    const leche = aplicarEventoInsumo(db, { tipo: "registrar", datos: { nombre: "leche", unidadMedida: "ml", costoUnitario: 1, stockMinimo: 3000 } });
    const producto = (nombre: string) => Number(db.prepare("INSERT INTO productos (nombre) VALUES (?)").run(nombre).lastInsertRowid);
    reemplazarReceta(db, producto("Café Latte"), 1, [{ insumoId: espresso, cantidad: 1 }, { insumoId: leche, cantidad: 250 }]);
    reemplazarReceta(db, producto("Doble Latte"), 1, [{ insumoId: espresso, cantidad: 2 }, { insumoId: leche, cantidad: 300 }]);
    if (conMovimiento) {
      db.prepare("INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, responsable) VALUES ('Reposición', ?, ?, 10, 'Administrador')").run(espresso, new Date().toISOString());
    }
    return { db, espresso };
  }

  const lineas = (db: ReturnType<typeof abrirBase>, producto: string) =>
    obtenerReceta(db, obtenerProductoPorNombre(db, producto)!.id)!.ingredientes.map((i) => [i.insumo_nombre, i.cantidad]);

  it("ajuste HU-06 · la migración 003 cambia espresso doble por 16 g de café en grano y lo elimina", () => {
    const { db, espresso } = baseConEspresso();
    aplicarMigraciones(db);
    expect(lineas(db, "Café Latte")).toEqual(expect.arrayContaining([["café en grano", 16], ["leche", 250]]));
    expect(lineas(db, "Doble Latte")).toEqual(expect.arrayContaining([["café en grano", 32], ["leche", 300]]));
    expect(obtenerInsumoPorNombre(db, "espresso doble")).toBeUndefined();
    expect(alertasDeInsumo(db, espresso)).toEqual([]);
    const cafe = obtenerInsumoPorNombre(db, "café en grano")!;
    expect(cafe).toMatchObject({ unidad_medida: "g", costo_unitario: 25, stock_actual: 0, stock_minimo: 500, activo: 1 });
    expect(alertasDeInsumo(db, cafe.id).map((a) => a.estado)).toEqual(["Vigente"]);
  });

  it("ajuste HU-06 · si la receta ya tenía café en grano, la migración 003 suma la cantidad", () => {
    const { db, espresso } = baseConEspresso();
    const cafe = aplicarEventoInsumo(db, { tipo: "registrar", datos: { nombre: "café en grano", unidadMedida: "g", costoUnitario: 25, stockMinimo: 500 } });
    const mixto = Number(db.prepare("INSERT INTO productos (nombre) VALUES ('Mixto')").run().lastInsertRowid);
    reemplazarReceta(db, mixto, 1, [{ insumoId: cafe, cantidad: 4 }, { insumoId: espresso, cantidad: 1 }]);
    aplicarMigraciones(db);
    expect(lineas(db, "Mixto")).toEqual([["café en grano", 20]]);
    expect(alertasDeInsumo(db, cafe)).toHaveLength(1);
  });

  it("ajuste HU-06 · con movimientos, la migración 003 solo desactiva el espresso doble", () => {
    const { db, espresso } = baseConEspresso(true);
    aplicarMigraciones(db);
    const insumo = obtenerInsumo(db, espresso)!;
    expect(insumo.activo).toBe(0);
    expect(alertasDeInsumo(db, espresso).filter((a) => a.estado === "Vigente")).toHaveLength(0);
    expect(lineas(db, "Café Latte")).toEqual(expect.arrayContaining([["café en grano", 16]]));
  });

  it("ajuste HU-06 · en una base sin espresso doble la migración 003 no hace nada", () => {
    const db = abrirBase();
    expect(obtenerInsumoPorNombre(db, "café en grano")).toBeUndefined();
    expect((db.prepare("SELECT COUNT(*) AS n FROM alertas_stock").get() as { n: number }).n).toBe(0);
  });
});
