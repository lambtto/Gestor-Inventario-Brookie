// Selector de rol de demostración (RP-09, supuesto S5). No hay autenticación real.
import { Router, type Request, type Response, type NextFunction } from 'express';

export const ROLES = ['Administrador', 'Barista', 'Caja'] as const;
export type Rol = (typeof ROLES)[number];
export const MENSAJE_ACCESO_DENEGADO = 'Acceso solo para el administrador';

function esRol(valor: unknown): valor is Rol {
  return typeof valor === 'string' && (ROLES as readonly string[]).includes(valor);
}

/** Lee la cookie «rol» (por defecto Administrador) y la deja disponible para las vistas. */
export function middlewareRol(req: Request, res: Response, next: NextFunction): void {
  const cookie: unknown = req.cookies?.rol;
  const rol: Rol = esRol(cookie) ? cookie : 'Administrador';
  res.locals.rol = rol;
  res.locals.roles = ROLES;
  res.locals.rutaActual = req.originalUrl;
  next();
}

/** Solo el Administrador accede al módulo de inventario (RP-09). */
export function soloAdministrador(_req: Request, res: Response, next: NextFunction): void {
  if (res.locals.rol === 'Administrador') return next();
  res.status(403).render('mensaje', { titulo: 'Acceso denegado', mensaje: MENSAJE_ACCESO_DENEGADO });
}

export const rutasRol = Router();

rutasRol.post('/rol', (req, res) => {
  const pedido: unknown = req.body.rol;
  const rol: Rol = esRol(pedido) ? pedido : 'Administrador';
  res.cookie('rol', rol, { sameSite: 'lax' });
  const volver: unknown = req.body.volver;
  const destino = typeof volver === 'string' && volver.startsWith('/') && !volver.startsWith('//') ? volver : '/';
  res.redirect(303, destino);
});
