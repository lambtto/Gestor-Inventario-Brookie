// HU-08 (DSS-07): cada mensaje del Administrador es una ruta. Están bajo /ventas, así que soloAdministrador (RP-09)
// las protege desde app.ts.
//   «Consultar ventas pendientes de insumos» → GET  /ventas/pendientes   (CU-12)
//   «Confirmar venta (venta)»                → POST /ventas/:id/confirmar (CU-13)
//   «Cancelar venta (venta)»                 → POST /ventas/:id/cancelar  (CU-14)
import { Router, type Request, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio } from '../dominio/insumo.js';
import { describirFaltantes } from '../dominio/venta.js';
import { formatoPesos } from '../servicios/pedidos.js';
import { cancelarVentaPendiente, confirmarVentaPendiente, listarVentasPendientes } from '../servicios/ventas.js';

export function rutasVentas(db: BaseDeDatos): Router {
  const r = Router();
  const esJson = (req: Request): boolean => Boolean(req.is('application/json')) || req.accepts(['html', 'json']) === 'json';

  function mostrar(res: Response, status = 200, mensajes: { ok?: string; error?: string } = {}): void {
    res.status(status).render('ventas-pendientes', {
      titulo: 'Ventas pendientes',
      pendientes: listarVentasPendientes(db),
      formatoPesos,
      describirFaltantes,
      ...mensajes,
    });
  }

  r.get('/ventas/pendientes', (req, res) => {
    if (esJson(req)) return res.json(listarVentasPendientes(db));
    mostrar(res);
  });

  function resolver(accion: (id: number) => string) {
    return (req: Request, res: Response): void => {
      const id = Number(req.params.id);
      try {
        const mensaje = accion(id);
        if (esJson(req)) {
          res.json({ mensaje });
          return;
        }
        mostrar(res, 200, { ok: mensaje });
      } catch (e) {
        if (!(e instanceof ErrorDeNegocio)) throw e;
        if (esJson(req)) {
          res.status(e.status).json({ error: e.message });
          return;
        }
        mostrar(res, e.status, { error: e.message });
      }
    };
  }

  r.post('/ventas/:id/confirmar', resolver((id) => confirmarVentaPendiente(db, id)));
  r.post('/ventas/:id/cancelar', resolver((id) => cancelarVentaPendiente(db, id)));

  return r;
}
