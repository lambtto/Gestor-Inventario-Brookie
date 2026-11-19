// Pantalla «Recetas»: CU-07 Definir receta de un producto. HU-06 CA2 y CA4.
import { Router, type Response } from 'express';
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio, listarInsumos } from '../dominio/insumo.js';
import { cantidadPorUnidad, listarProductos, obtenerProducto, obtenerReceta } from '../dominio/receta.js';
import { guardarReceta, MENSAJES_RECETA, type LineaFormulario } from '../servicios/recetas.js';

const LINEAS_VACIAS = 3;

function comoLista(valor: unknown): string[] {
  if (valor === undefined) return [];
  return (Array.isArray(valor) ? valor : [valor]).map((v) => String(v));
}

interface OpcionesReceta {
  status?: number;
  ok?: string;
  error?: string;
  extra?: number;
  enviado?: { rendimiento: string; lineas: LineaFormulario[] };
}

export function rutasRecetas(db: BaseDeDatos): Router {
  const r = Router();

  r.get('/recetas', (_req, res) => {
    res.render('recetas', { titulo: 'Recetas', productos: listarProductos(db) });
  });

  function mostrarReceta(res: Response, productoId: number, opciones: OpcionesReceta = {}): void {
    const producto = obtenerProducto(db, productoId);
    if (!producto) {
      res.status(404).render('mensaje', { titulo: 'No encontrado', mensaje: 'Producto no encontrado' });
      return;
    }
    const receta = obtenerReceta(db, productoId);
    // Líneas a mostrar: lo enviado (si hubo rechazo) o la receta guardada, más líneas vacías.
    const lineas: LineaFormulario[] = opciones.enviado
      ? opciones.enviado.lineas.filter((l) => l.insumoId || l.cantidad)
      : (receta?.ingredientes.map((i) => ({ insumoId: String(i.insumo_id), cantidad: String(i.cantidad) })) ?? []);
    const vacias = LINEAS_VACIAS + (opciones.extra ?? 0);
    for (let k = 0; k < vacias; k++) lineas.push({ insumoId: '', cantidad: '' });

    // Decisión C: se ofrecen los insumos activos y, además, los desactivados que ya están en la receta.
    const presentes = new Set(receta?.ingredientes.map((i) => i.insumo_id) ?? []);
    const insumos = listarInsumos(db).filter((i) => i.activo || presentes.has(i.id));

    res.status(opciones.status ?? 200).render('receta', {
      titulo: `Receta de ${producto.nombre}`,
      producto,
      receta,
      insumos,
      lineas,
      rendimiento: opciones.enviado?.rendimiento ?? (receta ? String(receta.rendimiento) : ''),
      siguienteExtra: (opciones.extra ?? 0) + LINEAS_VACIAS,
      porUnidad: cantidadPorUnidad,
      ok: opciones.ok,
      error: opciones.error,
    });
  }

  r.get('/recetas/:productoId', (req, res) => {
    mostrarReceta(res, Number(req.params.productoId), {
      ok: typeof req.query.ok === 'string' ? req.query.ok : undefined,
      extra: Math.min(Math.max(Number(req.query.extra) || 0, 0), 30),
    });
  });

  // CU-07: Definir receta (rendimiento + líneas insumo/cantidad)
  r.post('/recetas/:productoId', (req, res) => {
    const productoId = Number(req.params.productoId);
    const insumos = comoLista(req.body.insumo);
    const cantidades = comoLista(req.body.cantidad);
    const lineas: LineaFormulario[] = insumos.map((insumoId, k) => ({ insumoId, cantidad: cantidades[k] ?? '' }));
    const rendimiento = typeof req.body.rendimiento === 'string' ? req.body.rendimiento : '';
    try {
      guardarReceta(db, productoId, { rendimiento, lineas });
      res.redirect(303, `/recetas/${productoId}?ok=${encodeURIComponent(MENSAJES_RECETA.guardada)}`);
    } catch (e) {
      if (!(e instanceof ErrorDeNegocio)) throw e;
      mostrarReceta(res, productoId, { status: e.status, error: e.message, enviado: { rendimiento, lineas } });
    }
  });

  return r;
}
