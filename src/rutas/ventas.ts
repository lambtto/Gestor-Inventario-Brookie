// Pantalla «Ventas» (solo Administrador, RP-09): avisos de producto sin receta (HU-01 CA5)
// y pedidos con sus ventas y descuentos (CA2, CA4).
import { Router } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { listarAvisosSinReceta, listarPedidos } from '../dominio/pedido.js';
import { formatoCantidad } from '../servicios/ajustes.js';
import { formatoCLP } from '../servicios/insumos.js';

export function rutasVentas(db: BaseDeDatos): Router {
  const r = Router();

  r.get('/ventas', (_req, res) => {
    res.render('ventas', {
      titulo: 'Ventas',
      avisos: listarAvisosSinReceta(db),
      pedidos: listarPedidos(db),
      formatoCantidad,
      formatoCLP,
    });
  });

  return r;
}
