// Simulador del Sistema de toma de pedidos (S4/S7): convierte el formulario en el mensaje «Pedido confirmado».
// HU-01 · CU-01 · DSS-01. Decisiones D (monto por línea) y E (validaciones mínimas).
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio } from '../dominio/insumo.js';
import { procesarPedidoConfirmado, RECHAZO_PEDIDO, type LineaPedido } from '../dominio/pedido.js';
import { leerPesos } from './insumos.js';

/** Filas fijas del formulario del simulador (no hace falta JavaScript). */
export const FILAS_SIMULADOR = 5;

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : '';
}

/** Entero > 0 escrito solo con dígitos; NaN si no lo es. */
function leerEntero(valor: string): number {
  return /^\d+$/.test(valor) ? Number(valor) : Number.NaN;
}

/**
 * Lee las filas «producto_i», «cantidad_i», «monto_i». Las filas sin producto se ignoran;
 * una fila con producto y cantidad o monto inválidos rechaza el pedido completo.
 */
export function leerLineas(form: Record<string, unknown>): LineaPedido[] {
  const lineas: LineaPedido[] = [];
  for (let i = 0; i < FILAS_SIMULADOR; i++) {
    const producto = texto(form[`producto_${i}`]);
    if (!producto) continue;
    lineas.push({
      productoId: leerEntero(producto),
      cantidad: leerEntero(texto(form[`cantidad_${i}`])),
      monto: leerPesos(texto(form[`monto_${i}`])),
    });
  }
  return lineas;
}

/** Envía el «Pedido confirmado» al gestor y devuelve la respuesta «Pedido registrado». */
export function enviarPedidoConfirmado(db: BaseDeDatos, form: Record<string, unknown>): string {
  const lineas = leerLineas(form);
  if (lineas.length === 0) throw new ErrorDeNegocio(RECHAZO_PEDIDO);
  const numero = procesarPedidoConfirmado(db, lineas);
  return `Pedido N° ${numero} registrado`;
}
