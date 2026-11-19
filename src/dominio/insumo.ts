// Clase Insumo y AlertaDeStock del modelo de dominio (08-modelo-dominio.md).
// HU-06 · N05 Registrar insumos y recetas · Ciclo de vida: EST-01 (Insumo) y EST-02 (AlertaDeStock).
import type { BaseDeDatos } from '../db/conexion.js';

export interface Insumo {
  id: number;
  nombre: string;
  unidad_medida: string;
  costo_unitario: number;
  stock_actual: number;
  stock_minimo: number;
  activo: 0 | 1;
}

export type EstadoInsumo = 'Stock crítico' | 'Stock suficiente' | 'Desactivado';
export type EstadoAlerta = 'Vigente' | 'Resuelta';

export interface DatosInsumo {
  nombre: string;
  unidadMedida: string;
  costoUnitario: number;
  stockMinimo: number;
}

/** Error de una regla de negocio: lleva el mensaje que ve el usuario y el código HTTP. */
export class ErrorDeNegocio extends Error {
  constructor(
    mensaje: string,
    public readonly status: number = 400,
  ) {
    super(mensaje);
  }
}

export class EliminacionRechazada extends ErrorDeNegocio {
  constructor() {
    super('Eliminación rechazada (solo se puede desactivar)', 409);
  }
}

/**
 * EST-01: el estado no se guarda, se deriva (decisión confirmada en la revisión de especificaciones).
 * Desactivado si activo = 0; Stock crítico si stock ≤ mínimo; si no, Stock suficiente.
 */
export function estadoInsumo(insumo: Pick<Insumo, 'activo' | 'stock_actual' | 'stock_minimo'>): EstadoInsumo {
  if (!insumo.activo) return 'Desactivado';
  return insumo.stock_actual <= insumo.stock_minimo ? 'Stock crítico' : 'Stock suficiente';
}

export type EventoInsumo =
  | { tipo: 'registrar'; datos: DatosInsumo }
  | { tipo: 'desactivar'; insumoId: number }
  | { tipo: 'eliminar'; insumoId: number };

/**
 * Única función que aplica las transiciones de EST-01 y EST-02 que usa HU-06.
 * Devuelve el id del insumo afectado. Cada evento corre en una transacción.
 */
export function aplicarEventoInsumo(db: BaseDeDatos, evento: EventoInsumo): number {
  return db.transaction((): number => {
    switch (evento.tipo) {
      case 'registrar': {
        // (inicial) --Registrar insumo / generar alerta--> Stock crítico (nace con stock 0)
        const { nombre, unidadMedida, costoUnitario, stockMinimo } = evento.datos;
        const r = db
          .prepare(
            `INSERT INTO insumos (nombre, unidad_medida, costo_unitario, stock_actual, stock_minimo, activo)
             VALUES (?, ?, ?, 0, ?, 1)`,
          )
          .run(nombre, unidadMedida, costoUnitario, stockMinimo);
        const id = Number(r.lastInsertRowid);
        generarAlerta(db, id);
        return id;
      }
      case 'desactivar': {
        // Stock suficiente / Stock crítico --Desactivar insumo / resolver alerta--> Desactivado
        const insumo = obtenerInsumoObligatorio(db, evento.insumoId);
        if (estadoInsumo(insumo) === 'Desactivado') {
          throw new ErrorDeNegocio('El insumo ya está desactivado');
        }
        db.prepare('UPDATE insumos SET activo = 0 WHERE id = ?').run(insumo.id);
        resolverAlertaVigente(db, insumo.id);
        return insumo.id;
      }
      case 'eliminar': {
        // Cualquier estado --Eliminar insumo [no está en recetas y no tiene movimientos] / eliminar alerta--> (final)
        const insumo = obtenerInsumoObligatorio(db, evento.insumoId);
        if (formaParteDeReceta(db, insumo.id) || tieneMovimientos(db, insumo.id)) {
          throw new EliminacionRechazada();
        }
        // Las alertas se eliminan por ON DELETE CASCADE.
        db.prepare('DELETE FROM insumos WHERE id = ?').run(insumo.id);
        return insumo.id;
      }
    }
  })();
}

function generarAlerta(db: BaseDeDatos, insumoId: number): void {
  db.prepare("INSERT INTO alertas_stock (insumo_id, fecha_generacion, estado) VALUES (?, ?, 'Vigente')").run(
    insumoId,
    new Date().toISOString(),
  );
}

function resolverAlertaVigente(db: BaseDeDatos, insumoId: number): void {
  db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ? AND estado = 'Vigente'").run(insumoId);
}

export function formaParteDeReceta(db: BaseDeDatos, insumoId: number): boolean {
  return db.prepare('SELECT 1 FROM ingredientes WHERE insumo_id = ? LIMIT 1').get(insumoId) !== undefined;
}

export function tieneMovimientos(db: BaseDeDatos, insumoId: number): boolean {
  return db.prepare('SELECT 1 FROM movimientos_inventario WHERE insumo_id = ? LIMIT 1').get(insumoId) !== undefined;
}

export function obtenerInsumo(db: BaseDeDatos, id: number): Insumo | undefined {
  return db.prepare('SELECT * FROM insumos WHERE id = ?').get(id) as Insumo | undefined;
}

export function obtenerInsumoPorNombre(db: BaseDeDatos, nombre: string): Insumo | undefined {
  return db.prepare('SELECT * FROM insumos WHERE nombre = ?').get(nombre.trim()) as Insumo | undefined;
}

function obtenerInsumoObligatorio(db: BaseDeDatos, id: number): Insumo {
  const insumo = obtenerInsumo(db, id);
  if (!insumo) throw new ErrorDeNegocio('Insumo no encontrado', 404);
  return insumo;
}

export function listarInsumos(db: BaseDeDatos): Insumo[] {
  return db.prepare('SELECT * FROM insumos ORDER BY nombre COLLATE NOCASE').all() as Insumo[];
}

export function alertasDeInsumo(db: BaseDeDatos, insumoId: number): { id: number; estado: EstadoAlerta }[] {
  return db.prepare('SELECT id, estado FROM alertas_stock WHERE insumo_id = ? ORDER BY id').all(insumoId) as {
    id: number;
    estado: EstadoAlerta;
  }[];
}
