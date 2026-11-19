// Pantalla «Insumos»: CU-06 Registrar insumo (DSS-04) y CU-08 Dar de baja un insumo (DSS-05). HU-06.
import { Router, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio, EliminacionRechazada, listarInsumos } from '../dominio/insumo.js';
import { desactivarInsumo, eliminarInsumo, MENSAJES_INSUMO, registrarInsumo } from '../servicios/insumos.js';

interface OpcionesVista {
  status?: number;
  ok?: string;
  error?: string;
  ofrecerDesactivar?: number;
  form?: Record<string, unknown>;
}

export function rutasInsumos(db: BaseDeDatos): Router {
  const r = Router();

  function mostrar(res: Response, opciones: OpcionesVista = {}): void {
    res.status(opciones.status ?? 200).render('insumos', {
      titulo: 'Insumos',
      insumos: listarInsumos(db),
      ok: opciones.ok,
      error: opciones.error,
      ofrecerDesactivar: opciones.ofrecerDesactivar,
      form: opciones.form ?? {},
    });
  }

  function manejarError(res: Response, e: unknown, extra: OpcionesVista = {}): void {
    if (e instanceof ErrorDeNegocio) return mostrar(res, { ...extra, status: e.status, error: e.message });
    throw e;
  }

  r.get('/insumos', (req, res) => {
    mostrar(res, { ok: typeof req.query.ok === 'string' ? req.query.ok : undefined });
  });

  // DSS-04: Registrar insumo (nombre, unidad de medida, costo unitario, stock mínimo)
  r.post('/insumos', (req, res) => {
    try {
      registrarInsumo(db, req.body);
      res.redirect(303, `/insumos?ok=${encodeURIComponent(MENSAJES_INSUMO.registrado)}`);
    } catch (e) {
      manejarError(res, e, { form: req.body });
    }
  });

  // DSS-05: Eliminar insumo (insumo)
  r.post('/insumos/:id/eliminar', (req, res) => {
    const id = Number(req.params.id);
    try {
      eliminarInsumo(db, id);
      res.redirect(303, `/insumos?ok=${encodeURIComponent(MENSAJES_INSUMO.eliminado)}`);
    } catch (e) {
      // opt de DSS-05: tras el rechazo se ofrece desactivarlo
      manejarError(res, e, e instanceof EliminacionRechazada ? { ofrecerDesactivar: id } : {});
    }
  });

  // DSS-05: Desactivar insumo (insumo)
  r.post('/insumos/:id/desactivar', (req, res) => {
    try {
      desactivarInsumo(db, Number(req.params.id));
      res.redirect(303, `/insumos?ok=${encodeURIComponent(MENSAJES_INSUMO.desactivado)}`);
    } catch (e) {
      manejarError(res, e);
    }
  });

  return r;
}
