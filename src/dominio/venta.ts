// Clase Venta del modelo de dominio (08-modelo-dominio.md): cantidad, monto, sinReceta, estado.
// Evaluación 2 (eval2-ventas-pendientes) · HU-01 CA7, HU-08 · RP-15 · Ciclo de vida: EST-03.
// Los insumos reciben los eventos «Pedido confirmado» / «Confirmar venta» de EST-01 / EST-02 (aplicarEventoInsumo).
import type { BaseDeDatos } from '../db/conexion.js';
import { aplicarEventoInsumo, ErrorDeNegocio } from './insumo.js';
import { cantidadPorUnidad, obtenerReceta, type Receta } from './receta.js';

/** Estados de EST-03 (y valores del CHECK de ventas.estado, migración 006). */
export const ESTADOS_VENTA = ['Confirmada', 'Pendiente de confirmación', 'Cancelada'] as const;
export type EstadoVenta = (typeof ESTADOS_VENTA)[number];

export const VENTA_CONFIRMADA = 'Venta confirmada';
export const VENTA_CANCELADA = 'Venta cancelada';

/** Mensajes de rechazo de DSS-07 (HU-08 CA3, CA5). */
export const RECHAZOS_VENTA = {
  confirmarFaltan: (faltantes: Faltante[]) => `Confirmación rechazada (faltan: ${describirFaltantes(faltantes)})`,
  confirmarNoPendiente: 'Confirmación rechazada (la venta no está pendiente)',
  cancelarNoPendiente: 'Cancelación rechazada (la venta no está pendiente)',
  noEncontrada: 'Venta no encontrada',
} as const;

export interface Venta {
  id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  monto: number;
  sin_receta: 0 | 1;
  estado: EstadoVenta;
}

/** Un insumo que no alcanza para la receta (se calcula, no se guarda: 08-modelo-dominio.md). */
export interface Faltante {
  insumo_id: number;
  insumo: string;
  unidad: string;
  necesario: number;
  stock: number;
  falta: number;
}

/** «mantequilla 20 g, harina 5 g» */
export function describirFaltantes(faltantes: Faltante[]): string {
  return faltantes.map((f) => `${f.insumo} ${formatoCantidad(f.falta)} ${f.unidad}`).join(', ');
}

/** Aviso al Administrador (HU-01 CA7, DSS-01 «Aviso de venta pendiente de insumos (producto, insumos que faltan)»). */
export function avisoVentaPendiente(producto: string, faltantes: Faltante[]): string {
  return `Aviso de venta pendiente de insumos (${producto}; faltan: ${describirFaltantes(faltantes)})`;
}

function formatoCantidad(valor: number): string {
  return String(Math.round(valor * 1000) / 1000).replace('.', ',');
}

function redondear(valor: number): number {
  return Math.round(valor * 1000) / 1000;
}

/** Cantidad que necesita cada insumo de la receta para vender `unidades` (suma por insumo). */
function necesidades(receta: Receta, unidades: number): Map<number, number> {
  const porInsumo = new Map<number, number>();
  for (const ing of receta.ingredientes) {
    const cantidad = cantidadPorUnidad(ing.cantidad, receta.rendimiento) * unidades;
    porInsumo.set(ing.insumo_id, redondear((porInsumo.get(ing.insumo_id) ?? 0) + cantidad));
  }
  return porInsumo;
}

/**
 * Guarda «hay stock suficiente» de EST-03: insumos de la receta cuyo stock actual es menor que lo que necesita
 * (SV1: stock ≥ necesario alcanza, puede quedar en 0). Incluye insumos desactivados (SV2). Vacío = alcanza.
 */
export function faltantesDeReceta(db: BaseDeDatos, receta: Receta, unidades: number): Faltante[] {
  const faltantes: Faltante[] = [];
  for (const [insumoId, necesario] of necesidades(receta, unidades)) {
    const fila = db.prepare('SELECT nombre, unidad_medida, stock_actual FROM insumos WHERE id = ?').get(insumoId) as {
      nombre: string;
      unidad_medida: string;
      stock_actual: number;
    };
    if (fila.stock_actual < necesario) {
      faltantes.push({
        insumo_id: insumoId,
        insumo: fila.nombre,
        unidad: fila.unidad_medida,
        necesario,
        stock: fila.stock_actual,
        falta: redondear(necesario - fila.stock_actual),
      });
    }
  }
  return faltantes;
}

export type EventoVenta =
  | { tipo: 'pedidoConfirmado'; pedidoId: number; productoId: number; cantidad: number; monto: number }
  | { tipo: 'confirmarVenta'; ventaId: number }
  | { tipo: 'cancelarVenta'; ventaId: number };

export interface ResultadoEventoVenta {
  ventaId: number;
  estado: EstadoVenta;
  sinReceta: boolean;
  faltantes: Faltante[];
}

/**
 * Única función que aplica las transiciones de EST-03 (Venta). Cada evento corre en una transacción.
 * Las transiciones no modeladas (confirmar sin stock, confirmar o cancelar una venta no pendiente) lanzan ErrorDeNegocio.
 */
export function aplicarEventoVenta(db: BaseDeDatos, evento: EventoVenta): ResultadoEventoVenta {
  return db.transaction((): ResultadoEventoVenta => {
    switch (evento.tipo) {
      case 'pedidoConfirmado': {
        // (inicial) --Pedido confirmado [hay stock o sin receta] / descontar insumos--> Confirmada
        // (inicial) --Pedido confirmado [falta stock] / avisar pendiente--> Pendiente de confirmación
        const { pedidoId, productoId, cantidad, monto } = evento;
        const receta = obtenerReceta(db, productoId);
        const faltantes = receta ? faltantesDeReceta(db, receta, cantidad) : [];
        const estado: EstadoVenta = faltantes.length > 0 ? 'Pendiente de confirmación' : 'Confirmada';
        const ventaId = Number(
          db
            .prepare(
              'INSERT INTO ventas (pedido_id, producto_id, cantidad, monto, sin_receta, estado) VALUES (?, ?, ?, ?, ?, ?)',
            )
            .run(pedidoId, productoId, cantidad, monto, receta ? 0 : 1, estado).lastInsertRowid,
        );
        // SV4: todo o nada por venta. Solo se descuenta si alcanza para toda la receta.
        if (receta && estado === 'Confirmada') descontarReceta(db, 'pedidoConfirmado', receta, cantidad, pedidoId, ventaId);
        return { ventaId, estado, sinReceta: !receta, faltantes };
      }
      case 'confirmarVenta': {
        // Pendiente de confirmación --Confirmar venta [hay stock] / descontar insumos--> Confirmada
        const venta = obtenerVentaObligatoria(db, evento.ventaId);
        if (venta.estado !== 'Pendiente de confirmación') throw new ErrorDeNegocio(RECHAZOS_VENTA.confirmarNoPendiente, 409);
        const receta = obtenerReceta(db, venta.producto_id);
        const faltantes = receta ? faltantesDeReceta(db, receta, venta.cantidad) : [];
        if (faltantes.length > 0) throw new ErrorDeNegocio(RECHAZOS_VENTA.confirmarFaltan(faltantes), 409);
        if (receta) descontarReceta(db, 'confirmarVenta', receta, venta.cantidad, venta.pedido_id, venta.id);
        db.prepare("UPDATE ventas SET estado = 'Confirmada' WHERE id = ?").run(venta.id);
        return { ventaId: venta.id, estado: 'Confirmada', sinReceta: !receta, faltantes: [] };
      }
      case 'cancelarVenta': {
        // Pendiente de confirmación --Cancelar venta--> Cancelada (no descuenta nada)
        const venta = obtenerVentaObligatoria(db, evento.ventaId);
        if (venta.estado !== 'Pendiente de confirmación') throw new ErrorDeNegocio(RECHAZOS_VENTA.cancelarNoPendiente, 409);
        db.prepare("UPDATE ventas SET estado = 'Cancelada' WHERE id = ?").run(venta.id);
        return { ventaId: venta.id, estado: 'Cancelada', sinReceta: venta.sin_receta === 1, faltantes: [] };
      }
    }
  })();
}

/** Envía a cada insumo de la receta el evento de EST-01 / EST-02 que descuenta (Descuento asociado a la Venta). */
function descontarReceta(
  db: BaseDeDatos,
  tipo: 'pedidoConfirmado' | 'confirmarVenta',
  receta: Receta,
  unidades: number,
  pedidoId: number,
  ventaId: number,
): void {
  for (const [insumoId, cantidad] of necesidades(receta, unidades)) {
    aplicarEventoInsumo(db, { tipo, insumoId, cantidad, pedidoId, ventaId });
  }
}

export function obtenerVenta(db: BaseDeDatos, id: number): Venta | undefined {
  return db.prepare('SELECT * FROM ventas WHERE id = ?').get(id) as Venta | undefined;
}

function obtenerVentaObligatoria(db: BaseDeDatos, id: number): Venta {
  const venta = Number.isInteger(id) ? obtenerVenta(db, id) : undefined;
  if (!venta) throw new ErrorDeNegocio(RECHAZOS_VENTA.noEncontrada, 404);
  return venta;
}
