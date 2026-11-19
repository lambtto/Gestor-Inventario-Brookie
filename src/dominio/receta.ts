// Clases Producto, Receta e Ingrediente del modelo de dominio (08-modelo-dominio.md).
// HU-06 · N05 · CU-07 Definir receta de un producto. Las recetas no se versionan (HU-06 CA4).
import type { BaseDeDatos } from '../db/conexion.js';

export interface Producto {
  id: number;
  nombre: string;
}

export interface Ingrediente {
  insumo_id: number;
  insumo_nombre: string;
  unidad_medida: string;
  insumo_activo: 0 | 1;
  cantidad: number;
}

export interface Receta {
  id: number;
  producto_id: number;
  rendimiento: number;
  ingredientes: Ingrediente[];
}

export interface LineaReceta {
  insumoId: number;
  cantidad: number;
}

/**
 * Cantidad de un insumo que consume una unidad vendida del producto:
 * cantidad de la receta / rendimiento (ej.: 300 g por tanda de 10 → 30 g por galleta).
 */
export function cantidadPorUnidad(cantidad: number, rendimiento: number): number {
  return cantidad / rendimiento;
}

export function listarProductos(db: BaseDeDatos): (Producto & { tiene_receta: 0 | 1 })[] {
  return db
    .prepare(
      `SELECT p.id, p.nombre, EXISTS (SELECT 1 FROM recetas r WHERE r.producto_id = p.id) AS tiene_receta
       FROM productos p ORDER BY p.id`,
    )
    .all() as (Producto & { tiene_receta: 0 | 1 })[];
}

export function obtenerProducto(db: BaseDeDatos, id: number): Producto | undefined {
  return db.prepare('SELECT id, nombre FROM productos WHERE id = ?').get(id) as Producto | undefined;
}

export function obtenerProductoPorNombre(db: BaseDeDatos, nombre: string): Producto | undefined {
  return db.prepare('SELECT id, nombre FROM productos WHERE nombre = ?').get(nombre) as Producto | undefined;
}

export function obtenerReceta(db: BaseDeDatos, productoId: number): Receta | undefined {
  const receta = db.prepare('SELECT id, producto_id, rendimiento FROM recetas WHERE producto_id = ?').get(productoId) as
    | Omit<Receta, 'ingredientes'>
    | undefined;
  if (!receta) return undefined;
  const ingredientes = db
    .prepare(
      `SELECT i.insumo_id, s.nombre AS insumo_nombre, s.unidad_medida, s.activo AS insumo_activo, i.cantidad
       FROM ingredientes i JOIN insumos s ON s.id = i.insumo_id
       WHERE i.receta_id = ? ORDER BY i.id`,
    )
    .all(receta.id) as Ingrediente[];
  return { ...receta, ingredientes };
}

/** Crea o reemplaza la receta completa del producto en una transacción. */
export function reemplazarReceta(db: BaseDeDatos, productoId: number, rendimiento: number, lineas: LineaReceta[]): void {
  db.transaction(() => {
    const existente = db.prepare('SELECT id FROM recetas WHERE producto_id = ?').get(productoId) as
      | { id: number }
      | undefined;
    let recetaId: number;
    if (existente) {
      recetaId = existente.id;
      db.prepare('UPDATE recetas SET rendimiento = ? WHERE id = ?').run(rendimiento, recetaId);
      db.prepare('DELETE FROM ingredientes WHERE receta_id = ?').run(recetaId);
    } else {
      recetaId = Number(
        db.prepare('INSERT INTO recetas (producto_id, rendimiento) VALUES (?, ?)').run(productoId, rendimiento)
          .lastInsertRowid,
      );
    }
    const insertar = db.prepare('INSERT INTO ingredientes (receta_id, insumo_id, cantidad) VALUES (?, ?, ?)');
    for (const linea of lineas) insertar.run(recetaId, linea.insumoId, linea.cantidad);
    // Los Descuentos (movimientos_inventario) guardan su propia cantidad: no se tocan.
  })();
}
