// Pantalla «Registrar ingreso»: CU-05 (HU-05, DSS-03). Decisión D1 (pantalla y lista de reposiciones).
import { Router, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio, listarInsumos } from '../dominio/insumo.js';
import { formatoCantidad } from '../servicios/ajustes.js';
import { listarReposiciones, registrarIngreso } from '../servicios/ingresos.js';

interface OpcionesVista {
  status?: number;
  ok?: string;
  error?: string;
  form?: Record<string, unknown>;
}

export function rutasIngresos(db: BaseDeDatos): Router {
  const r = Router();

  function mostrar(res: Response, opciones: OpcionesVista = {}): void {
    res.status(opciones.status ?? 200).render('ingresos', {
      titulo: 'Registrar ingreso',
      insumos: listarInsumos(db).filter((i) => i.activo),
      reposiciones: listarReposiciones(db),
      ok: opciones.ok,
      error: opciones.error,
      form: opciones.form ?? {},
      formatoCantidad,
    });
  }

  r.get('/ingresos', (req, res) => {
    mostrar(res, { ok: typeof req.query.ok === 'string' ? req.query.ok : undefined });
  });

  // DSS-03: Registrar ingreso (insumo, cantidad recibida)
  r.post('/ingresos', (req, res) => {
    try {
      const mensaje = registrarIngreso(db, req.body, String(res.locals.rol));
      res.redirect(303, `/ingresos?ok=${encodeURIComponent(mensaje)}`);
    } catch (e) {
      if (e instanceof ErrorDeNegocio) return mostrar(res, { status: e.status, error: e.message, form: req.body });
      throw e;
    }
  });

  return r;
}
