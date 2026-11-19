// Utilidades de prueba: cada prueba usa su propia base en memoria (no usa los datos de ejemplo, SH4).
import { abrirBase, type BaseDeDatos } from '../src/db/conexion.js';
import { crearApp } from '../src/app.js';
import { aplicarEventoInsumo } from '../src/dominio/insumo.js';
import { reemplazarReceta, type LineaReceta } from '../src/dominio/receta.js';

export function nuevoEntorno() {
  const db = abrirBase(':memory:');
  const app = crearApp(db);
  return { db, app };
}

/** Registra un insumo como lo haría CU-06 (con stock 0 y alerta vigente). */
export function dadoInsumo(db: BaseDeDatos, nombre: string, unidadMedida = 'g', stockMinimo = 100, costoUnitario = 1): number {
  return aplicarEventoInsumo(db, { tipo: 'registrar', datos: { nombre, unidadMedida, costoUnitario, stockMinimo } });
}

export function dadoProducto(db: BaseDeDatos, nombre: string): number {
  return Number(db.prepare('INSERT INTO productos (nombre) VALUES (?)').run(nombre).lastInsertRowid);
}

export function dadaReceta(db: BaseDeDatos, productoId: number, rendimiento: number, lineas: LineaReceta[]): void {
  reemplazarReceta(db, productoId, rendimiento, lineas);
}

export function dadaReposicion(db: BaseDeDatos, insumoId: number, cantidad: number): void {
  db.prepare(
    "INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, responsable) VALUES ('Reposición', ?, ?, ?, 'Administrador')",
  ).run(insumoId, new Date().toISOString(), cantidad);
  db.prepare('UPDATE insumos SET stock_actual = stock_actual + ? WHERE id = ?').run(cantidad, insumoId);
}

export function cuenta(db: BaseDeDatos, sql: string, ...params: unknown[]): number {
  return (db.prepare(sql).get(...params) as { n: number }).n;
}
