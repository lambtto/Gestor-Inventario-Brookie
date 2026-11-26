// Aplicación web del gestor de inventario de Brookies Coffee.
import express from 'express';
import cookieParser from 'cookie-parser';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { BaseDeDatos } from './db/conexion.js';
import { middlewareRol, rutasRol, soloAdministrador } from './rutas/rol.js';
import { rutasInsumos } from './rutas/insumos.js';
import { rutasRecetas } from './rutas/recetas.js';
import { rutasAjustes } from './rutas/ajustes.js';
import { rutasPedidos } from './rutas/pedidos.js';
import { rutasIngresos } from './rutas/ingresos.js';
import { rutasVentas } from './rutas/ventas.js';

/** Crea la aplicación sin escuchar un puerto (las pruebas la usan con su propia base). */
export function crearApp(db: BaseDeDatos): express.Express {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', join(dirname(fileURLToPath(import.meta.url)), 'vistas'));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json()); // HU-01: el Sistema de toma de pedidos puede enviar el pedido en JSON
  app.use(cookieParser());
  app.use(middlewareRol);

  app.get('/', (_req, res) => res.redirect('/insumos'));
  app.use(rutasRol);
  // RP-09: el módulo de inventario es solo para el Administrador
  app.use(['/insumos', '/recetas', '/ajustes', '/ingresos', '/ventas'], soloAdministrador);
  app.use(rutasInsumos(db));
  app.use(rutasRecetas(db));
  app.use(rutasAjustes(db)); // HU-07
  app.use(rutasIngresos(db)); // HU-05
  app.use(rutasVentas(db)); // HU-08 (/ventas/pendientes, /ventas/:id/confirmar, /ventas/:id/cancelar)
  app.use(rutasPedidos(db)); // HU-01 (/simulador representa al sistema externo: no exige rol)
  return app;
}
