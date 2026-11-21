// Datos de ejemplo (idempotente). Fuente: 05-elicitacion.md, Técnica 2 (cuaderno de recetas del dueño).
// Supuestos: S1 (productos precargados), S8 (unidades del cuaderno), SH1 (Banana Cloud sin receta),
// SH3 (costo unitario y stock mínimo son VALORES DE DEMOSTRACIÓN: el cuaderno no los trae).
import { pathToFileURL } from 'node:url';
import { abrirBase, type BaseDeDatos } from './conexion.js';
import { aplicarEventoInsumo, obtenerInsumoPorNombre, tieneMovimientos } from '../dominio/insumo.js';
import { obtenerProductoPorNombre, obtenerReceta, reemplazarReceta } from '../dominio/receta.js';

export const PRODUCTOS = [
  'Lemon Empire',
  'Biscoff Central',
  'SoHo',
  'M&M',
  'Oreo',
  'Nut York',
  'Liberty Kiss',
  'Velvet Avenue',
  'Pistacho Queens',
  'Café Latte',
  "Cold Brew Brookie's",
  'Banana Cloud',
  'Capuchino',
];

// [nombre, unidad de medida, costo unitario de demostración (entero, CLP), stock mínimo de demostración]
export const INSUMOS: [string, string, number, number][] = [
  ['mantequilla', 'g', 12, 1000],
  ['azúcar rubia', 'g', 2, 500],
  ['azúcar blanca', 'g', 2, 500],
  ['huevo más yema', 'g', 6, 400],
  ['harina con polvos', 'g', 1, 2000],
  ['maicena', 'g', 3, 100],
  ['sal', 'g', 1, 20],
  ['vainilla', 'cucharadita', 150, 5],
  ['chocolate chip', 'g', 15, 400],
  ['chocolate blanco', 'g', 18, 400],
  ['cacao', 'g', 20, 100],
  ['colorante rojo en gel', 'g', 40, 15],
  ['pistacho', 'g', 35, 200],
  ['café en grano', 'g', 25, 500],
  ['leche', 'ml', 1, 3000],
  ['café molido grueso', 'g', 25, 500],
  ['agua fría', 'g', 0, 5000],
  ['cacao Pacari', 'g', 30, 100],
  ['canela', 'g', 20, 100],
];

const BASE_MASA: [string, number][] = [
  ['mantequilla', 250],
  ['azúcar rubia', 120],
  ['azúcar blanca', 80],
  ['huevo más yema', 80],
  ['harina con polvos', 400],
  ['maicena', 20],
  ['sal', 2],
  ['vainilla', 1],
];

// [producto, rendimiento, ingredientes]. Masas: 1 tanda = 10 galletas. Bebidas: 1 taza o vaso.
export const RECETAS: [string, number, [string, number][]][] = [
  ['Lemon Empire', 10, BASE_MASA],
  ['Biscoff Central', 10, BASE_MASA],
  ['SoHo', 10, [...BASE_MASA, ['chocolate chip', 100]]],
  ['M&M', 10, [...BASE_MASA, ['chocolate chip', 100]]],
  ['Oreo', 10, [...BASE_MASA, ['chocolate chip', 100]]],
  ['Nut York', 10, [...BASE_MASA, ['chocolate chip', 100]]],
  ['Liberty Kiss', 10, [...BASE_MASA, ['chocolate blanco', 100]]],
  ['Velvet Avenue', 10, [...BASE_MASA, ['chocolate blanco', 100], ['cacao', 20], ['colorante rojo en gel', 3]]],
  ['Pistacho Queens', 10, [...BASE_MASA, ['pistacho', 50], ['chocolate blanco', 50]]],
  ['Café Latte', 1, [['café en grano', 16], ['leche', 250]]],
  ["Cold Brew Brookie's", 1, [['café molido grueso', 100], ['agua fría', 1000]]],
  ['Capuchino', 1, [['café en grano', 16], ['leche', 150], ['cacao Pacari', 20]]],
  // Banana Cloud: sin receta (SH1)
];

function idInsumo(db: BaseDeDatos, nombre: string): number {
  const insumo = obtenerInsumoPorNombre(db, nombre);
  if (!insumo) throw new Error(`Falta el insumo de ejemplo ${nombre}`);
  return insumo.id;
}

/** Carga los datos de ejemplo sin duplicar ni sobrescribir lo que ya exista. */
export function cargarDatosDeEjemplo(db: BaseDeDatos): void {
  db.transaction(() => {
    const insertarProducto = db.prepare('INSERT OR IGNORE INTO productos (nombre) VALUES (?)');
    for (const nombre of PRODUCTOS) insertarProducto.run(nombre);

    for (const [nombre, unidadMedida, costoUnitario, stockMinimo] of INSUMOS) {
      if (!obtenerInsumoPorNombre(db, nombre)) {
        // Igual que CU-06: nace con stock 0 y alerta de stock crítico vigente.
        aplicarEventoInsumo(db, { tipo: 'registrar', datos: { nombre, unidadMedida, costoUnitario, stockMinimo } });
      }
    }

    for (const [producto, rendimiento, ingredientes] of RECETAS) {
      const p = obtenerProductoPorNombre(db, producto)!;
      if (obtenerReceta(db, p.id)) continue; // no sobrescribe recetas existentes
      reemplazarReceta(
        db,
        p.id,
        rendimiento,
        ingredientes.map(([insumo, cantidad]) => ({ insumoId: idInsumo(db, insumo), cantidad })),
      );
    }

    // Canela: fuera de toda receta, con una Reposición de 500 g (escenario «insumo con movimientos»).
    const canela = idInsumo(db, 'canela');
    if (!tieneMovimientos(db, canela)) {
      db.prepare(
        "INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, responsable) VALUES ('Reposición', ?, ?, 500, 'Administrador')",
      ).run(canela, new Date().toISOString());
      db.prepare('UPDATE insumos SET stock_actual = stock_actual + 500 WHERE id = ?').run(canela);
      // Con 500 g supera su mínimo de demostración (100 g): su alerta queda resuelta (EST-02).
      db.prepare(
        "UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ? AND estado = 'Vigente' AND (SELECT stock_actual > stock_minimo FROM insumos WHERE id = ?)",
      ).run(canela, canela);
    }
  })();
}

// Ejecución directa: npm run db:seed
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ruta = process.env.DB_PATH ?? 'data/app.db';
  const db = abrirBase(ruta);
  cargarDatosDeEjemplo(db);
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  console.log(
    `Datos de ejemplo listos en ${ruta}: ${n('SELECT COUNT(*) AS n FROM productos')} productos, ` +
      `${n('SELECT COUNT(*) AS n FROM insumos')} insumos, ${n('SELECT COUNT(*) AS n FROM recetas')} recetas.`,
  );
  db.close();
}
