// Arranca el servidor con la base data/app.db (o la ruta de DB_PATH).
import { abrirBase } from './db/conexion.js';
import { crearApp } from './app.js';

const ruta = process.env.DB_PATH ?? 'data/app.db';
const puerto = Number(process.env.PORT ?? 3000);

const db = abrirBase(ruta);
crearApp(db).listen(puerto, () => {
  console.log(`Gestor de inventario de Brookies Coffee en http://localhost:${puerto}`);
});
