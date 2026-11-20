// Clase Insumo y AlertaDeStock del modelo de dominio (08-modelo-dominio.md).
// HU-06 · N05 Registrar insumos y recetas · Ciclo de vida: EST-01 (Insumo) y EST-02 (AlertaDeStock).
// Ajuste 2026-11-19 (ajuste-hu-06-editar-reactivar-validaciones): eventos editar (CU-09) y reactivar (CU-10).
// HU-07 (hu-07-ajustar-stock): evento ajustar (CU-11, DSS-06).
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

/** Ajuste.motivo (08-modelo-dominio.md, RP-14). */
export const MOTIVOS_AJUSTE = ['Merma', 'Corrección de conteo'] as const;
export type MotivoAjuste = (typeof MOTIVOS_AJUSTE)[number];

/** Mensajes de rechazo de un ajuste (HU-07 CA4, decisión D3). */
export const RECHAZOS_AJUSTE = {
  datoFaltante: 'Ajuste rechazado (dato faltante)',
  superaStock: 'Ajuste rechazado (la cantidad supera el stock)',
  mermaNoPositiva: 'Ajuste rechazado (la cantidad perdida debe ser mayor que 0)',
  contadaNegativa: 'Ajuste rechazado (la cantidad contada no puede ser negativa)',
} as const;

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
  | { tipo: 'editar'; insumoId: number; datos: DatosInsumo }
  | { tipo: 'desactivar'; insumoId: number }
  | { tipo: 'reactivar'; insumoId: number }
  | { tipo: 'ajustar'; insumoId: number; motivo: MotivoAjuste; cantidad: number; responsable: string }
  | { tipo: 'descontar'; insumoId: number; cantidad: number; pedidoId: number }
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
      case 'editar': {
        // CU-09 (HU-06 CA5). Si está activo, el nuevo mínimo recalcula el estado (EST-01) y la alerta (EST-02):
        //   Stock suficiente --Editar insumo [stock ≤ nuevo mínimo] / generar alerta--> Stock crítico
        //   Stock crítico --Editar insumo [stock > nuevo mínimo] / resolver alerta--> Stock suficiente
        // Un insumo Desactivado solo cambia sus datos: sigue Desactivado y sin alerta.
        const insumo = obtenerInsumoObligatorio(db, evento.insumoId);
        const { nombre, unidadMedida, costoUnitario, stockMinimo } = evento.datos;
        db.prepare(
          'UPDATE insumos SET nombre = ?, unidad_medida = ?, costo_unitario = ?, stock_minimo = ? WHERE id = ?',
        ).run(nombre, unidadMedida, costoUnitario, stockMinimo, insumo.id);
        const estado = estadoInsumo({ ...insumo, stock_minimo: stockMinimo });
        if (estado === 'Stock crítico' && !tieneAlertaVigente(db, insumo.id)) generarAlerta(db, insumo.id);
        if (estado === 'Stock suficiente') resolverAlertaVigente(db, insumo.id);
        return insumo.id;
      }
      case 'reactivar': {
        // CU-10 (HU-06 CA6). Desactivado --Reactivar insumo [stock ≤ mínimo] / generar alerta--> Stock crítico
        //                    Desactivado --Reactivar insumo [stock > mínimo]--> Stock suficiente
        const insumo = obtenerInsumoObligatorio(db, evento.insumoId);
        if (estadoInsumo(insumo) !== 'Desactivado') throw new ErrorDeNegocio('El insumo ya está activo');
        db.prepare('UPDATE insumos SET activo = 1 WHERE id = ?').run(insumo.id);
        if (estadoInsumo({ ...insumo, activo: 1 }) === 'Stock crítico') generarAlerta(db, insumo.id);
        return insumo.id;
      }
      case 'ajustar': {
        // CU-11 / DSS-06 (HU-07). Si el insumo está activo:
        //   Stock suficiente --Ajustar stock [stock resultante ≤ mínimo] / generar alerta--> Stock crítico
        //   Stock crítico --Ajustar stock [stock resultante > mínimo] / resolver alerta--> Stock suficiente
        // Un insumo Desactivado cambia su stock pero sigue Desactivado y sin alerta (11-diagramas-estado.md).
        const insumo = obtenerInsumoObligatorio(db, evento.insumoId);
        const { motivo, cantidad, responsable } = evento;
        let resultante: number;
        if (motivo === 'Merma') {
          if (!(cantidad > 0)) throw new ErrorDeNegocio(RECHAZOS_AJUSTE.mermaNoPositiva);
          resultante = insumo.stock_actual - cantidad;
          if (resultante < 0) throw new ErrorDeNegocio(RECHAZOS_AJUSTE.superaStock);
        } else {
          if (!(cantidad >= 0)) throw new ErrorDeNegocio(RECHAZOS_AJUSTE.contadaNegativa);
          resultante = cantidad;
        }
        resultante = redondear(resultante);
        const diferencia = redondear(resultante - insumo.stock_actual);
        db.prepare(
          `INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, responsable, motivo)
           VALUES ('Ajuste', ?, ?, ?, ?, ?)`,
        ).run(insumo.id, new Date().toISOString(), diferencia, responsable, motivo);
        db.prepare('UPDATE insumos SET stock_actual = ? WHERE id = ?').run(resultante, insumo.id);
        const estado = estadoInsumo({ ...insumo, stock_actual: resultante });
        if (estado === 'Stock crítico' && !tieneAlertaVigente(db, insumo.id)) generarAlerta(db, insumo.id);
        if (estado === 'Stock suficiente') resolverAlertaVigente(db, insumo.id);
        return insumo.id;
      }
      case 'descontar': {
        // CU-01 / DSS-01, DSS-02 (HU-01). Si el insumo está activo:
        //   Stock suficiente --Pedido confirmado [stock resultante ≤ mínimo] / generar alerta--> Stock crítico
        //   EST-02 (inicial) --Pedido confirmado [≤ mínimo, activo y sin alerta vigente]--> Vigente (decisión B)
        // Un insumo Desactivado se descuenta igual, sigue Desactivado y sin alerta (HU-01 CA6).
        // El stock puede quedar negativo: el pedido ya fue vendido (decisión A).
        const insumo = obtenerInsumoObligatorio(db, evento.insumoId);
        const cantidad = redondear(evento.cantidad);
        const resultante = redondear(insumo.stock_actual - cantidad);
        // El Descuento guarda su cantidad positiva: el tipo indica que resta.
        db.prepare(
          `INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, pedido_id)
           VALUES ('Descuento', ?, ?, ?, ?)`,
        ).run(insumo.id, new Date().toISOString(), cantidad, evento.pedidoId);
        db.prepare('UPDATE insumos SET stock_actual = ? WHERE id = ?').run(resultante, insumo.id);
        const estado = estadoInsumo({ ...insumo, stock_actual: resultante });
        if (estado === 'Stock crítico' && !tieneAlertaVigente(db, insumo.id)) generarAlerta(db, insumo.id);
        return insumo.id;
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

/** Evita arrastrar errores de punto flotante en las cantidades (0,1 + 0,2). */
function redondear(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}

function tieneAlertaVigente(db: BaseDeDatos, insumoId: number): boolean {
  return db.prepare("SELECT 1 FROM alertas_stock WHERE insumo_id = ? AND estado = 'Vigente' LIMIT 1").get(insumoId) !== undefined;
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
