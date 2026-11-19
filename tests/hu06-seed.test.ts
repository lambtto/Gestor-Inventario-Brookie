// HU-06 · Datos de ejemplo (supuestos S1, S8, SH1, SH3)
import { describe, it, expect } from 'vitest';
import { abrirBase } from '../src/db/conexion.js';
import { cargarDatosDeEjemplo } from '../src/db/seed.js';
import { obtenerProductoPorNombre, obtenerReceta } from '../src/dominio/receta.js';
import { obtenerInsumoPorNombre } from '../src/dominio/insumo.js';
import { cuenta } from './ayuda.js';

describe('HU-06 · Datos de ejemplo', () => {
  it('es idempotente: dos ejecuciones dejan 13 productos, 12 recetas y una alerta por insumo', () => {
    const db = abrirBase();
    cargarDatosDeEjemplo(db);
    cargarDatosDeEjemplo(db);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM productos')).toBe(13);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM recetas')).toBe(12);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM insumos')).toBe(19);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM alertas_stock')).toBe(19);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM movimientos_inventario')).toBe(1);
  });

  it('carga las recetas del cuaderno con sus unidades y Banana Cloud sin receta', () => {
    const db = abrirBase();
    cargarDatosDeEjemplo(db);
    const lemon = obtenerReceta(db, obtenerProductoPorNombre(db, 'Lemon Empire')!.id)!;
    expect(lemon.rendimiento).toBe(10);
    expect(lemon.ingredientes.find((i) => i.insumo_nombre === 'mantequilla')!.cantidad).toBe(250);
    expect(lemon.ingredientes.find((i) => i.insumo_nombre === 'vainilla')!.unidad_medida).toBe('cucharadita');
    const latte = obtenerReceta(db, obtenerProductoPorNombre(db, 'Café Latte')!.id)!;
    expect(latte.ingredientes.map((i) => [i.insumo_nombre, i.cantidad, i.unidad_medida])).toEqual([
      ['café en grano', 16, 'g'],
      ['leche', 250, 'ml'],
    ]);
    // Ajuste café en grano (decisiones M y N): el espresso doble es una preparación de 16 g de café en grano
    const capuchino = obtenerReceta(db, obtenerProductoPorNombre(db, 'Capuchino')!.id)!;
    expect(capuchino.ingredientes.map((i) => [i.insumo_nombre, i.cantidad, i.unidad_medida])).toEqual([
      ['café en grano', 16, 'g'],
      ['leche', 150, 'ml'],
      ['cacao Pacari', 20, 'g'],
    ]);
    expect(obtenerInsumoPorNombre(db, 'espresso doble')).toBeUndefined();
    expect(obtenerInsumoPorNombre(db, 'café en grano')).toMatchObject({ unidad_medida: 'g', costo_unitario: 25, stock_minimo: 500 });
    expect(obtenerReceta(db, obtenerProductoPorNombre(db, 'Banana Cloud')!.id)).toBeUndefined();
    const canela = obtenerInsumoPorNombre(db, 'canela')!;
    expect(canela.stock_actual).toBe(500);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM ingredientes WHERE insumo_id = ?', canela.id)).toBe(0);
  });

  it("ajuste HU-06 · todos los costos de ejemplo son enteros en CLP (decisión L)", () => {
    const db = abrirBase();
    cargarDatosDeEjemplo(db);
    const costos = (db.prepare("SELECT costo_unitario AS c FROM insumos").all() as { c: number }[]).map((f) => f.c);
    expect(costos.every((c) => Number.isInteger(c) && c >= 0)).toBe(true);
    expect(obtenerInsumoPorNombre(db, "azúcar blanca")!.costo_unitario).toBe(2);
    expect(obtenerInsumoPorNombre(db, "agua fría")!.costo_unitario).toBe(0);
  });
});
