// Clases Pedido y Venta del modelo de dominio (08-modelo-dominio.md).
// HU-01 · N01 Descontar insumos y registrar venta · CU-01 · DSS-01 / DSS-02 · RP-01, RP-08.
import type { BaseDeDatos } from '../db/conexion.js';
import { aplicarEventoInsumo, ErrorDeNegocio } from './insumo.js';
import { obtenerProducto, obtenerReceta } from './receta.js';

export const RECHAZO_PEDIDO = 'Pedido rechazado (dato faltante o inválido)';

/** Una línea del mensaje «Pedido confirmado» (productos, cantidades, monto). */
export interface LineaPedido {
  productoId: number;
  cantidad: number;
  monto: number;
}

export interface VentaRegistrada {
  producto_nombre: string;
  cantidad: number;
  monto: number;
  sin_receta: 0 | 1;
}

export interface DescuentoRegistrado {
  insumo_nombre: string;
  unidad_medida: string;
  cantidad: number;
  fecha: string;
}

export interface PedidoRegistrado {
  id: number;
  numero: number;
  fecha_hora: string;
  monto_total: number;
  ventas: VentaRegistrada[];
  descuentos: DescuentoRegistrado[];
}

export interface AvisoSinReceta {
  producto_nombre: string;
  numero: number;
}

function lineaValida(db: BaseDeDatos, l: LineaPedido): boolean {
  return (
    Number.isInteger(l.productoId) &&
    obtenerProducto(db, l.productoId) !== undefined &&
    Number.isInteger(l.cantidad) &&
    l.cantidad > 0 &&
    Number.isInteger(l.monto) &&
    l.monto >= 0
  );
}

/**
 * Mensaje «Pedido confirmado» de DSS-01. Registra el Pedido, una Venta por línea y los Descuentos
 * según la receta, todo en una sola transacción. Devuelve el número del pedido («Pedido registrado»).
 */
export function procesarPedidoConfirmado(db: BaseDeDatos, lineas: LineaPedido[]): number {
  return db.transaction((): number => {
    if (lineas.length === 0 || !lineas.every((l) => lineaValida(db, l))) throw new ErrorDeNegocio(RECHAZO_PEDIDO);

    const { siguiente } = db.prepare('SELECT COALESCE(MAX(numero), 0) + 1 AS siguiente FROM pedidos').get() as {
      siguiente: number;
    };
    const montoTotal = lineas.reduce((suma, l) => suma + l.monto, 0);
    const pedidoId = Number(
      db
        .prepare('INSERT INTO pedidos (numero, fecha_hora, monto_total) VALUES (?, ?, ?)')
        .run(siguiente, new Date().toISOString(), montoTotal).lastInsertRowid,
    );

    const insertarVenta = db.prepare(
      'INSERT INTO ventas (pedido_id, producto_id, cantidad, monto, sin_receta) VALUES (?, ?, ?, ?, ?)',
    );
    // loop por cada producto del pedido (DSS-01)
    for (const linea of lineas) {
      const receta = obtenerReceta(db, linea.productoId);
      if (!receta) {
        // alt: el producto no tiene receta → venta «sin receta», aviso al administrador, sin descuento (CA5)
        insertarVenta.run(pedidoId, linea.productoId, linea.cantidad, linea.monto, 1);
        continue;
      }
      // alt: el producto tiene receta → registra la venta y descuenta los insumos (CA1, CA2, CA4)
      insertarVenta.run(pedidoId, linea.productoId, linea.cantidad, linea.monto, 0);
      for (const ingrediente of receta.ingredientes) {
        aplicarEventoInsumo(db, {
          tipo: 'descontar',
          insumoId: ingrediente.insumo_id,
          cantidad: (ingrediente.cantidad * linea.cantidad) / receta.rendimiento,
          pedidoId,
        });
      }
    }
    return siguiente;
  })();
}

/** Pedidos con sus ventas y descuentos, del más reciente al más antiguo (pantalla «Ventas»). */
export function listarPedidos(db: BaseDeDatos): PedidoRegistrado[] {
  const pedidos = db
    .prepare('SELECT id, numero, fecha_hora, monto_total FROM pedidos ORDER BY numero DESC')
    .all() as Omit<PedidoRegistrado, 'ventas' | 'descuentos'>[];
  const ventas = db.prepare(
    `SELECT p.nombre AS producto_nombre, v.cantidad, v.monto, v.sin_receta
     FROM ventas v JOIN productos p ON p.id = v.producto_id
     WHERE v.pedido_id = ? ORDER BY v.id`,
  );
  const descuentos = db.prepare(
    `SELECT i.nombre AS insumo_nombre, i.unidad_medida, m.cantidad, m.fecha
     FROM movimientos_inventario m JOIN insumos i ON i.id = m.insumo_id
     WHERE m.tipo = 'Descuento' AND m.pedido_id = ? ORDER BY m.id`,
  );
  return pedidos.map((p) => ({
    ...p,
    ventas: ventas.all(p.id) as VentaRegistrada[],
    descuentos: descuentos.all(p.id) as DescuentoRegistrado[],
  }));
}

/** Avisos de producto sin receta (CA5): se derivan de las ventas marcadas «sin receta». */
export function listarAvisosSinReceta(db: BaseDeDatos): AvisoSinReceta[] {
  return db
    .prepare(
      `SELECT pr.nombre AS producto_nombre, pe.numero
       FROM ventas v JOIN productos pr ON pr.id = v.producto_id JOIN pedidos pe ON pe.id = v.pedido_id
       WHERE v.sin_receta = 1 ORDER BY pe.numero DESC, v.id`,
    )
    .all() as AvisoSinReceta[];
}
