// Pantalla «Insumos»: CU-06 Registrar insumo (DSS-04), CU-08 Dar de baja un insumo (DSS-05),
// CU-09 Editar insumo y CU-10 Reactivar insumo (HU-06 CA5, CA6). Formularios en ventana emergente (CA8).
import { Router, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio, EliminacionRechazada, listarInsumos } from '../dominio/insumo.js';
import {
  desactivarInsumo,
  editarInsumo,
  eliminarInsumo,
  formatoCLP,
  MENSAJES_INSUMO,
  reactivarInsumo,
  registrarInsumo,
} from '../servicios/insumos.js';

/** Ventana emergente que debe mostrarse abierta (tras un rechazo), con el motivo y lo que escribió el usuario. */
interface Dialogo {
  accion: string;
  titulo: string;
  error: string;
  form: Record<string, unknown>;
}

interface OpcionesVista {
  status?: number;
  ok?: string;
  error?: string;
  ofrecerDesactivar?: number;
  dialogo?: Dialogo;
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
      dialogo: opciones.dialogo,
      formatoCLP,
    });
  }

  function manejarError(res: Response, e: unknown, extra: OpcionesVista = {}): void {
    if (e instanceof ErrorDeNegocio) return mostrar(res, { ...extra, status: e.status, error: e.message });
    throw e;
  }

  /** Rechazo de un formulario de la ventana: se vuelve a mostrar abierta con el motivo y los datos escritos. */
  function manejarErrorDeFormulario(res: Response, e: unknown, accion: string, titulo: string, form: unknown): void {
    if (e instanceof ErrorDeNegocio) {
      return mostrar(res, {
        status: e.status,
        dialogo: { accion, titulo, error: e.message, form: (form ?? {}) as Record<string, unknown> },
      });
    }
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
      manejarErrorDeFormulario(res, e, '/insumos', 'Registrar insumo', req.body);
    }
  });

  // CU-09: Editar insumo (nombre, unidad de medida, costo unitario, stock mínimo)
  r.post('/insumos/:id/editar', (req, res) => {
    const id = Number(req.params.id);
    try {
      editarInsumo(db, id, req.body);
      res.redirect(303, `/insumos?ok=${encodeURIComponent(MENSAJES_INSUMO.actualizado)}`);
    } catch (e) {
      manejarErrorDeFormulario(res, e, `/insumos/${id}/editar`, 'Editar insumo', req.body);
    }
  });

  // CU-10: Reactivar insumo
  r.post('/insumos/:id/reactivar', (req, res) => {
    try {
      reactivarInsumo(db, Number(req.params.id));
      res.redirect(303, `/insumos?ok=${encodeURIComponent(MENSAJES_INSUMO.reactivado)}`);
    } catch (e) {
      manejarError(res, e);
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
