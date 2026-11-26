// CU-01 Registrar venta y descontar insumos. HU-01 · N01 · DSS-01 / DSS-02 · RP-01, RP-02, RP-08.
// El Sistema de toma de pedidos es externo y se simula (S4): envía el «Pedido confirmado» a este servicio.
// Evaluación 2 (eval2-ventas-pendientes): si a la receta le falta stock, la venta queda «Pendiente de confirmación»
// (HU-01 CA7, RP-15, EST-03); reemplaza la decisión D1 (stock negativo).
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio } from '../dominio/insumo.js';
import { obtenerProductoPorNombre } from '../dominio/receta.js';
import { aplicarEventoVenta, avisoVentaPendiente, type EstadoVenta } from '../dominio/venta.js';
import { leerPesos } from './insumos.js';

export const PEDIDO_REGISTRADO = 'Pedido registrado';

/** Mensajes de rechazo de un pedido (decisión D2 de la ficha HU-01). */
export const RECHAZOS_PEDIDO = {
  numeroInvalido: 'Pedido rechazado (falta el número de pedido o no es un entero mayor que 0)',
  sinProductos: 'Pedido rechazado (el pedido no trae productos)',
  productoNoEncontrado: (nombre: string) => `Pedido rechazado (producto no encontrado: ${nombre})`,
  cantidadInvalida: (nombre: string) => `Pedido rechazado (la cantidad de ${nombre} debe ser un entero mayor que 0)`,
  montoInvalido: (nombre: string) => `Pedido rechazado (el monto de ${nombre} debe ser un entero en pesos mayor o igual a 0)`,
  repetido: 'Pedido rechazado (pedido ya registrado)',
} as const;

/** Aviso al Administrador (HU-01 CA5, DSS-01 «Aviso de producto sin receta (producto)»). */
export function avisoSinReceta(producto: string): string {
  return `Aviso de producto sin receta (${producto})`;
}

/** Un producto del pedido confirmado, tal como llega (puede venir incompleto). */
export interface ProductoDelPedido {
  producto?: unknown;
  cantidad?: unknown;
  monto?: unknown;
}

/** «Pedido confirmado» (productos, cantidades, monto) del Sistema de toma de pedidos. */
export interface PedidoConfirmado {
  numero?: unknown;
  productos?: unknown;
}

export interface ResultadoPedido {
  mensaje: typeof PEDIDO_REGISTRADO;
  numero: number;
  avisos: string[];
}

export interface VentaRegistrada {
  id: number;
  numero_pedido: number;
  fecha_hora: string;
  producto: string;
  cantidad: number;
  monto: number;
  sin_receta: 0 | 1;
  estado: EstadoVenta;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : '';
}

function enteroPositivo(valor: unknown): number {
  const t = texto(valor);
  return /^\d+$/.test(t) && Number(t) > 0 ? Number(t) : Number.NaN;
}

/**
 * Convierte el formulario del simulador (producto1, cantidad1, monto1, …) en un PedidoConfirmado.
 * Las filas sin producto se ignoran.
 */
export function pedidoDesdeFormulario(form: Record<string, unknown>): PedidoConfirmado {
  const productos: ProductoDelPedido[] = [];
  for (let i = 1; i <= 20; i++) {
    const producto = texto(form[`producto${i}`]);
    if (!producto) continue;
    productos.push({ producto, cantidad: form[`cantidad${i}`], monto: form[`monto${i}`] });
  }
  return { numero: form.numero, productos };
}

/**
 * CU-01: procesa un «Pedido confirmado» en una sola transacción (todo o nada).
 * Cada producto es un evento «Pedido confirmado» de EST-03 (aplicarEventoVenta), evaluado en orden con el stock que
 * dejaron los anteriores (SV3): con stock suficiente la Venta queda Confirmada y descuenta sus insumos; si falta stock
 * queda Pendiente de confirmación sin descontar nada (SV4) y devuelve el aviso; sin receta registra la Venta marcada
 * sin receta y devuelve el aviso. Lanza ErrorDeNegocio «Pedido rechazado (…)».
 */
export function registrarPedidoConfirmado(db: BaseDeDatos, pedido: PedidoConfirmado): ResultadoPedido {
  const numero = enteroPositivo(pedido.numero);
  if (Number.isNaN(numero)) throw new ErrorDeNegocio(RECHAZOS_PEDIDO.numeroInvalido);
  const lineas = Array.isArray(pedido.productos) ? (pedido.productos as ProductoDelPedido[]) : [];
  if (lineas.length === 0) throw new ErrorDeNegocio(RECHAZOS_PEDIDO.sinProductos);

  const productos = lineas.map((linea) => {
    const nombre = texto(linea?.producto);
    const producto = nombre ? obtenerProductoPorNombre(db, nombre) : undefined;
    if (!producto) throw new ErrorDeNegocio(RECHAZOS_PEDIDO.productoNoEncontrado(nombre || '(vacío)'));
    const cantidad = enteroPositivo(linea.cantidad);
    if (Number.isNaN(cantidad)) throw new ErrorDeNegocio(RECHAZOS_PEDIDO.cantidadInvalida(producto.nombre));
    const montoTexto = texto(linea.monto).replace(/^\$/, '');
    const monto = montoTexto === '' ? Number.NaN : leerPesos(montoTexto);
    if (Number.isNaN(monto)) throw new ErrorDeNegocio(RECHAZOS_PEDIDO.montoInvalido(producto.nombre));
    return { producto, cantidad, monto };
  });

  if (db.prepare('SELECT 1 FROM pedidos WHERE numero = ?').get(numero) !== undefined) {
    throw new ErrorDeNegocio(RECHAZOS_PEDIDO.repetido, 409);
  }

  return db.transaction((): ResultadoPedido => {
    const montoTotal = productos.reduce((suma, p) => suma + p.monto, 0);
    const pedidoId = Number(
      db
        .prepare('INSERT INTO pedidos (numero, fecha_hora, monto_total) VALUES (?, ?, ?)')
        .run(numero, new Date().toISOString(), montoTotal).lastInsertRowid,
    );
    const avisos: string[] = [];
    // DSS-01: loop por cada producto del pedido
    for (const { producto, cantidad, monto } of productos) {
      const r = aplicarEventoVenta(db, { tipo: 'pedidoConfirmado', pedidoId, productoId: producto.id, cantidad, monto });
      // alt falta stock de algún insumo: Venta Pendiente de confirmación, aviso al Administrador (CA7)
      if (r.estado === 'Pendiente de confirmación') avisos.push(avisoVentaPendiente(producto.nombre, r.faltantes));
      // alt el producto no tiene receta: Venta sin receta, sin descuento, aviso al Administrador (CA5, S2)
      else if (r.sinReceta) avisos.push(avisoSinReceta(producto.nombre));
    }
    return { mensaje: PEDIDO_REGISTRADO, numero, avisos };
  })();
}

/** Ventas registradas, de la más reciente a la más antigua (pantalla «Ventas», decisión D3). */
export function listarVentas(db: BaseDeDatos): VentaRegistrada[] {
  return db
    .prepare(
      `SELECT v.id, p.numero AS numero_pedido, p.fecha_hora, pr.nombre AS producto, v.cantidad, v.monto, v.sin_receta,
              v.estado
       FROM ventas v JOIN pedidos p ON p.id = v.pedido_id JOIN productos pr ON pr.id = v.producto_id
       ORDER BY p.fecha_hora DESC, v.id DESC`,
    )
    .all() as VentaRegistrada[];
}

/** Avisos de producto sin receta para el Administrador (uno por Venta sin receta). */
export function listarAvisosSinReceta(db: BaseDeDatos): { numero_pedido: number; fecha_hora: string; aviso: string }[] {
  return listarVentas(db)
    .filter((v) => v.sin_receta === 1)
    .map((v) => ({ numero_pedido: v.numero_pedido, fecha_hora: v.fecha_hora, aviso: avisoSinReceta(v.producto) }));
}

/** Número sugerido para el siguiente pedido del simulador (último + 1). */
export function siguienteNumeroPedido(db: BaseDeDatos): number {
  const fila = db.prepare('SELECT MAX(numero) AS n FROM pedidos').get() as { n: number | null };
  return (fila.n ?? 0) + 1;
}

/** Monto en pesos chilenos con punto de miles ($7.000). */
export function formatoPesos(valor: number): string {
  return '$' + Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
