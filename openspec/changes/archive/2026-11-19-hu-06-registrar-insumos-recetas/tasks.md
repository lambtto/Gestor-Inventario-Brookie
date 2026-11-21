# Tareas: HU-06 — Registrar insumos y recetas

## 1. Esqueleto del proyecto

- [x] 1.1 Crear `package.json` (scripts `dev`, `start`, `db:seed`, `test`), `tsconfig.json` estricto, `vitest.config.ts` y agregar `data/` y `node_modules/` a `.gitignore`; verificar que `npm install` termina sin errores
- [x] 1.2 Crear `src/db/conexion.ts` (abrir base con `foreign_keys = ON`, aplicar migraciones en orden registrándolas en `schema_migrations`); verificar con una prueba que aplicar dos veces no duplica migraciones
- [x] 1.3 Crear `src/db/migrations/001_hu06_insumos_recetas.sql` con las tablas del diseño (insumos, productos, recetas, ingredientes, alertas_stock, pedidos, movimientos_inventario); verificar con una prueba que existen las tablas y que `ingredientes.cantidad = 0` es rechazada por la base
- [x] 1.4 Crear `src/app.ts` (`crearApp(db)`), `src/server.ts` y `src/vistas/layout.ejs`; verificar que `npm run dev` responde en http://localhost:3000

## 2. Selector de rol (acceso-por-rol)

- [x] 2.1 Implementar `POST /rol`, el middleware de rol (por defecto Administrador) y el selector en `layout.ejs`; verificar con la prueba «HU-06 · Cambiar de rol»
- [x] 2.2 Implementar `soloAdministrador` y la vista `acceso-denegado.ejs`; verificar con las pruebas «HU-06 · Barista intenta registrar un insumo» y «HU-06 · Caja intenta definir una receta» (escribirlas cuando existan las rutas de los grupos 3 y 4)

## 3. Insumos (gestion-insumos)

- [x] 3.1 Implementar `src/dominio/insumo.ts`: tipos, estado derivado y `aplicarEventoInsumo` con los eventos registrar, desactivar y eliminar (EST-01/EST-02); verificar con pruebas unitarias de cada transición y de la guarda de eliminar
- [x] 3.2 Implementar `src/servicios/insumos.ts` con validación (cuatro datos obligatorios, nombre único sin distinguir mayúsculas, costo y mínimo numéricos ≥ 0) y los mensajes de la especificación; verificar con las pruebas «HU-06 · Registrar un insumo sin unidad de medida», «HU-06 · Nombre repetido» y «HU-06 · Costo negativo»
- [x] 3.3 Implementar las rutas `GET/POST /insumos`, `POST /insumos/:id/eliminar`, `POST /insumos/:id/desactivar` y la vista `insumos.ejs` (lista + formulario + mensajes + botón Desactivar tras un rechazo); verificar con las pruebas «HU-06 · Registrar un insumo nuevo», «HU-06 · Alerta creada con el insumo» y «HU-06 · Ver la lista de insumos»
- [x] 3.4 Escribir las pruebas «HU-06 · Eliminar un insumo sin recetas ni movimientos», «HU-06 · Un insumo usado en una receta no se puede eliminar», «HU-06 · Un insumo con movimientos registrados no se puede eliminar» y «HU-06 · Desactivar un insumo con alerta vigente»; verificar que pasan con `npm test`

## 4. Recetas (recetas-productos)

- [x] 4.1 Implementar `src/dominio/receta.ts` y `src/servicios/recetas.ts` (guardar reemplazando líneas en una transacción; validar al menos un ingrediente, cantidades y rendimiento > 0, sin insumos repetidos, sin agregar insumos desactivados pero conservando los ya presentes); verificar con las pruebas «HU-06 · Receta sin ingredientes», «HU-06 · Cantidad inválida», «HU-06 · Insumo desactivado no se puede agregar» e «HU-06 · Insumo desactivado ya presente se conserva»
- [x] 4.2 Implementar las rutas `GET /recetas`, `GET/POST /recetas/:productoId` y las vistas `recetas.ejs` y `receta.ejs` (3 líneas vacías y «Agregar más líneas»); verificar con las pruebas «HU-06 · Definir la receta de un producto» y «HU-06 · Producto sin receta»
- [x] 4.3 Escribir la prueba «HU-06 · Cambiar una receta no altera los Descuentos anteriores» (inserta un pedido y un Descuento de 50 g; cambia la receta a 300 g / 10; verifica que el Descuento sigue en 50 g y que la receta da 30 g por unidad); verificar que pasa

## 5. Datos de ejemplo

- [x] 5.1 Implementar `src/db/seed.ts` idempotente con los 13 productos, los insumos (con su alerta Vigente), las recetas del cuaderno, Banana Cloud sin receta y la canela con su Reposición de 500 g, marcando costos y mínimos como demostración; verificar con una prueba que ejecutarlo dos veces deja 13 productos, 12 recetas y una sola alerta por insumo

## 6. Integración y documentación

- [x] 6.1 Ejecutar `npm test` completo y comprobar que pasan todas las pruebas (una por escenario de las tres especificaciones)
- [x] 6.2 Actualizar `README.md` con la sección de la aplicación: requisitos (Node 20+), `npm install`, `npm run db:seed`, `npm run dev`, URL, datos de ejemplo y `npm test`; verificar ejecutando los comandos tal como están escritos

## Workflow follow-up

- Revisión de las especificaciones por el estudiante (confirmación d) antes de implementar.
- Validación del sistema con `/cin324-validar-sistema` y luego archivar el cambio.
