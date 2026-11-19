// CU-11 Ajustar stock (merma o corrección de conteo). HU-07 · DSS-06 · RP-14 / RP-08.
import type { BaseDeDatos } from '../db/conexion.js';
import {
  aplicarEventoInsumo,
  ErrorDeNegocio,
  MOTIVOS_AJUSTE,
  obtenerInsumo,
  RECHAZOS_AJUSTE,
  type MotivoAjuste,
} from '../dominio/insumo.js';
import { leerNumero } from './insumos.js';

/** Datos tal como llegan del formulario (pueden faltar). */
export interface FormularioAjuste {
  insumoId?: unknown;
  motivo?: unknown;
  cantidad?: unknown;
}

export interface AjusteRegistrado {
  id: number;
  fecha: string;
  insumo_nombre: string;
  unidad_medida: string;
  motivo: MotivoAjuste;
  cantidad: number;
  responsable: string;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : '';
}

function esMotivo(valor: string): valor is MotivoAjuste {
  return (MOTIVOS_AJUSTE as readonly string[]).includes(valor);
}

/** Muestra una cantidad sin decimales sobrantes (1700, 0.5). */
export function formatoCantidad(valor: number): string {
  return String(Math.round(valor * 1000) / 1000);
}

/** Cantidad con signo para la lista de ajustes (+200, -300, 0). */
export function formatoConSigno(valor: number): string {
  return (valor > 0 ? '+' : '') + formatoCantidad(valor);
}

/**
 * CU-11: registra un ajuste y devuelve el mensaje de confirmación con el stock resultante (decisión D2).
 * Lanza ErrorDeNegocio con «Ajuste rechazado (…)» si no se puede.
 */
export function registrarAjuste(db: BaseDeDatos, form: FormularioAjuste, responsable: string): string {
  const insumoId = Number(texto(form.insumoId));
  const motivo = texto(form.motivo);
  const cantidadTexto = texto(form.cantidad);
  const cantidad = leerNumero(cantidadTexto);
  const insumo = Number.isInteger(insumoId) && insumoId > 0 ? obtenerInsumo(db, insumoId) : undefined;
  if (!insumo || !esMotivo(motivo) || !cantidadTexto || Number.isNaN(cantidad)) {
    throw new ErrorDeNegocio(RECHAZOS_AJUSTE.datoFaltante);
  }
  aplicarEventoInsumo(db, { tipo: 'ajustar', insumoId: insumo.id, motivo, cantidad, responsable });
  const actualizado = obtenerInsumo(db, insumo.id)!;
  return `Ajuste registrado (stock actualizado: ${formatoCantidad(actualizado.stock_actual)} ${actualizado.unidad_medida})`;
}

/** Ajustes registrados, del más reciente al más antiguo (HU-07 CA3, decisión D1). */
export function listarAjustes(db: BaseDeDatos): AjusteRegistrado[] {
  return db
    .prepare(
      `SELECT m.id, m.fecha, i.nombre AS insumo_nombre, i.unidad_medida, m.motivo, m.cantidad, m.responsable
       FROM movimientos_inventario m JOIN insumos i ON i.id = m.insumo_id
       WHERE m.tipo = 'Ajuste'
       ORDER BY m.fecha DESC, m.id DESC`,
    )
    .all() as AjusteRegistrado[];
}
