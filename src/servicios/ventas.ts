// HU-08 Resolver venta pendiente de insumos · CU-12, CU-13, CU-14 · DSS-07 · EST-03 · RP-15, RP-08, RP-09.
import type { BaseDeDatos } from '../db/conexion.js';
import { obtenerReceta } from '../dominio/receta.js';
import {
  aplicarEventoVenta,
  faltantesDeReceta,
  VENTA_CANCELADA,
  VENTA_CONFIRMADA,
  type Faltante,
} from '../dominio/venta.js';

export interface VentaPendiente {
  id: number;
  numero_pedido: number;
  fecha_hora: string;
  producto: string;
  cantidad: number;
  monto: number;
  faltantes: Faltante[];
}

/** CU-12: ventas «Pendiente de confirmación», con los insumos que faltan calculados con el stock actual (HU-08 CA1). */
export function listarVentasPendientes(db: BaseDeDatos): VentaPendiente[] {
  const filas = db
    .prepare(
      `SELECT v.id, v.producto_id, p.numero AS numero_pedido, p.fecha_hora, pr.nombre AS producto, v.cantidad, v.monto
       FROM ventas v JOIN pedidos p ON p.id = v.pedido_id JOIN productos pr ON pr.id = v.producto_id
       WHERE v.estado = 'Pendiente de confirmación'
       ORDER BY p.fecha_hora, v.id`,
    )
    .all() as (Omit<VentaPendiente, 'faltantes'> & { producto_id: number })[];
  return filas.map(({ producto_id, ...fila }) => {
    const receta = obtenerReceta(db, producto_id);
    return { ...fila, faltantes: receta ? faltantesDeReceta(db, receta, fila.cantidad) : [] };
  });
}

/** CU-13 «Confirmar venta (venta)» → «Venta confirmada» o ErrorDeNegocio «Confirmación rechazada (…)». */
export function confirmarVentaPendiente(db: BaseDeDatos, ventaId: number): typeof VENTA_CONFIRMADA {
  aplicarEventoVenta(db, { tipo: 'confirmarVenta', ventaId });
  return VENTA_CONFIRMADA;
}

/** CU-14 «Cancelar venta (venta)» → «Venta cancelada» o ErrorDeNegocio «Cancelación rechazada (…)». */
export function cancelarVentaPendiente(db: BaseDeDatos, ventaId: number): typeof VENTA_CANCELADA {
  aplicarEventoVenta(db, { tipo: 'cancelarVenta', ventaId });
  return VENTA_CANCELADA;
}
