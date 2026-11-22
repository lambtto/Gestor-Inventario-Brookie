// CU-05 Registrar ingreso de stock. HU-05 · N04 Reabastecer stock · DSS-03 · RP-05 / RP-08.
import type { BaseDeDatos } from '../db/conexion.js';
import { aplicarEventoInsumo, ErrorDeNegocio, obtenerInsumo, RECHAZOS_INGRESO } from '../dominio/insumo.js';
import { formatoCantidad } from './ajustes.js';
import { leerNumero } from './insumos.js';

/** Datos tal como llegan del formulario (pueden faltar). */
export interface FormularioIngreso {
  insumoId?: unknown;
  cantidad?: unknown;
}

export interface ReposicionRegistrada {
  id: number;
  fecha: string;
  insumo_nombre: string;
  unidad_medida: string;
  cantidad: number;
  responsable: string;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : '';
}

/**
 * DSS-03: «Registrar ingreso (insumo, cantidad recibida)». Devuelve «Ingreso registrado (stock actualizado: …)».
 * Lanza ErrorDeNegocio «Ingreso rechazado (…)» si no se puede.
 */
export function registrarIngreso(db: BaseDeDatos, form: FormularioIngreso, responsable: string): string {
  const insumoId = Number(texto(form.insumoId));
  const insumo = Number.isInteger(insumoId) && insumoId > 0 ? obtenerInsumo(db, insumoId) : undefined;
  if (!insumo) throw new ErrorDeNegocio(RECHAZOS_INGRESO.faltaInsumo);
  const cantidadTexto = texto(form.cantidad);
  if (!cantidadTexto) throw new ErrorDeNegocio(RECHAZOS_INGRESO.faltaCantidad);
  const cantidad = leerNumero(cantidadTexto);
  if (Number.isNaN(cantidad) || cantidad <= 0) throw new ErrorDeNegocio(RECHAZOS_INGRESO.cantidadNoPositiva);
  aplicarEventoInsumo(db, { tipo: 'registrarIngreso', insumoId: insumo.id, cantidad, responsable });
  const actualizado = obtenerInsumo(db, insumo.id)!;
  return `Ingreso registrado (stock actualizado: ${formatoCantidad(actualizado.stock_actual)} ${actualizado.unidad_medida})`;
}

/** Reposiciones registradas, de la más reciente a la más antigua (HU-05 CA3, decisión D1). */
export function listarReposiciones(db: BaseDeDatos): ReposicionRegistrada[] {
  return db
    .prepare(
      `SELECT m.id, m.fecha, i.nombre AS insumo_nombre, i.unidad_medida, m.cantidad, m.responsable
       FROM movimientos_inventario m JOIN insumos i ON i.id = m.insumo_id
       WHERE m.tipo = 'Reposición'
       ORDER BY m.fecha DESC, m.id DESC`,
    )
    .all() as ReposicionRegistrada[];
}
