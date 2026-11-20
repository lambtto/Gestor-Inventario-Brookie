// Pantalla «Simulador de pedidos»: sustituye al Sistema de toma de pedidos (S4/S7), HU-01 · DSS-01.
// Disponible para cualquier rol: representa a la cajera usando la página web de pedidos (decisión E).
import { Router, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio } from '../dominio/insumo.js';
import { listarProductos } from '../dominio/receta.js';
import { enviarPedidoConfirmado, FILAS_SIMULADOR } from '../servicios/pedidos.js';

interface OpcionesVista {
  status?: number;
  ok?: string;
  error?: string;
  form?: Record<string, unknown>;
}

export function rutasSimulador(db: BaseDeDatos): Router {
  const r = Router();

  function mostrar(res: Response, opciones: OpcionesVista = {}): void {
    res.status(opciones.status ?? 200).render('simulador', {
      titulo: 'Simulador de pedidos',
      productos: listarProductos(db),
      filas: FILAS_SIMULADOR,
      ok: opciones.ok,
      error: opciones.error,
      form: opciones.form ?? {},
    });
  }

  r.get('/simulador', (req, res) => {
    mostrar(res, { ok: typeof req.query.ok === 'string' ? req.query.ok : undefined });
  });

  // DSS-01: Pedido confirmado (productos, cantidades, monto) → Pedido registrado
  r.post('/simulador', (req, res) => {
    try {
      const mensaje = enviarPedidoConfirmado(db, req.body as Record<string, unknown>);
      res.redirect(303, `/simulador?ok=${encodeURIComponent(mensaje)}`);
    } catch (e) {
      if (e instanceof ErrorDeNegocio) return mostrar(res, { status: e.status, error: e.message, form: req.body });
      throw e;
    }
  });

  return r;
}
