// Pantalla «Ajustar stock»: CU-11 (HU-07, DSS-06). Decisiones D1 (pantalla y lista) y D2 (stock en el selector).
import { Router, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio, listarInsumos, MOTIVOS_AJUSTE } from '../dominio/insumo.js';
import { formatoCantidad, formatoConSigno, listarAjustes, registrarAjuste } from '../servicios/ajustes.js';

interface OpcionesVista {
  status?: number;
  ok?: string;
  error?: string;
  form?: Record<string, unknown>;
}

export function rutasAjustes(db: BaseDeDatos): Router {
  const r = Router();

  function mostrar(res: Response, opciones: OpcionesVista = {}): void {
    res.status(opciones.status ?? 200).render('ajustes', {
      titulo: 'Ajustar stock',
      insumos: listarInsumos(db),
      ajustes: listarAjustes(db),
      motivos: MOTIVOS_AJUSTE,
      ok: opciones.ok,
      error: opciones.error,
      form: opciones.form ?? {},
      formatoCantidad,
      formatoConSigno,
    });
  }

  r.get('/ajustes', (req, res) => {
    mostrar(res, { ok: typeof req.query.ok === 'string' ? req.query.ok : undefined });
  });

  // DSS-06: Ajustar stock (insumo, motivo, cantidad)
  r.post('/ajustes', (req, res) => {
    try {
      const mensaje = registrarAjuste(db, req.body, String(res.locals.rol));
      res.redirect(303, `/ajustes?ok=${encodeURIComponent(mensaje)}`);
    } catch (e) {
      if (e instanceof ErrorDeNegocio) return mostrar(res, { status: e.status, error: e.message, form: req.body });
      throw e;
    }
  });

  return r;
}
