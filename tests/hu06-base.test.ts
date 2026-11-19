import { describe, it, expect } from 'vitest';
import { abrirBase, aplicarMigraciones } from '../src/db/conexion.js';

describe('Base de datos (HU-06)', () => {
  it('aplicar las migraciones dos veces no las duplica', () => {
    const db = abrirBase();
    aplicarMigraciones(db);
    const filas = db.prepare('SELECT COUNT(*) AS n FROM schema_migrations').get() as { n: number };
    expect(filas.n).toBe(2); // 001 (HU-06) y 002 (ajuste HU-06, costo CLP)
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
});
