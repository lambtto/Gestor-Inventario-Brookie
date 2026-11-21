// CU-01 (HU-01, DSS-01): entrada del «Pedido confirmado», Simulador de pedidos (S4) y pantalla «Ventas» (decisión D3).
import { Router, type Request, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio } from '../dominio/insumo.js';
import { listarProductos } from '../dominio/receta.js';
import {
  formatoPesos,
  listarAvisosSinReceta,
  listarVentas,
  pedidoDesdeFormulario,
  registrarPedidoConfirmado,
  siguienteNumeroPedido,
  type ResultadoPedido,
} from '../servicios/pedidos.js';

interface OpcionesSimulador {
  status?: number;
  resultado?: ResultadoPedido;
  error?: string;
  form?: Record<string, unknown>;
}

export function rutasPedidos(db: BaseDeDatos): Router {
  const r = Router();

  function mostrarSimulador(res: Response, opciones: OpcionesSimulador = {}): void {
    res.status(opciones.status ?? 200).render('simulador', {
      titulo: 'Simulador de pedidos',
      productos: listarProductos(db),
      numeroSugerido: siguienteNumeroPedido(db),
      ok: opciones.resultado ? `${opciones.resultado.mensaje} (pedido N° ${opciones.resultado.numero})` : undefined,
      avisos: opciones.resultado?.avisos ?? [],
      error: opciones.error,
      form: opciones.form ?? {},
    });
  }

  const esJson = (req: Request): boolean => Boolean(req.is('application/json'));

  // Sistema de toma de pedidos (simulado): formulario que envía el «Pedido confirmado».
  r.get('/simulador', (_req, res) => mostrarSimulador(res));

  // DSS-01: Pedido confirmado (productos, cantidades, monto) → «Pedido registrado»
  r.post('/pedidos', (req, res) => {
    const json = esJson(req);
    const pedido = json ? (req.body ?? {}) : pedidoDesdeFormulario(req.body ?? {});
    try {
      const resultado = registrarPedidoConfirmado(db, pedido);
      if (json) return res.status(201).json(resultado);
      mostrarSimulador(res, { status: 201, resultado });
    } catch (e) {
      if (!(e instanceof ErrorDeNegocio)) throw e;
      if (json) return res.status(e.status).json({ error: e.message });
      mostrarSimulador(res, { status: e.status, error: e.message, form: req.body });
    }
  });

  // Pantalla «Ventas» (solo Administrador, RP-09): ventas registradas y avisos de producto sin receta.
  r.get('/ventas', (_req, res) => {
    res.render('ventas', {
      titulo: 'Ventas',
      ventas: listarVentas(db),
      avisos: listarAvisosSinReceta(db),
      formatoPesos,
    });
  });

  return r;
}
