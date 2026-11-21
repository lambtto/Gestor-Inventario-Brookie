# Tareas: HU-01 — Registrar venta

## 1. Datos

- [x] 1.1 Crear `src/db/migrations/005_hu01_ventas.sql` con la tabla `ventas`; verificar con la prueba «HU-01 · Esquema de Venta» que existe y que rechaza una cantidad 0

## 2. Dominio (EST-01 / EST-02)

- [x] 2.1 Agregar el evento `pedidoConfirmado` a `aplicarEventoInsumo` (Descuento, stock resultante, generar alerta solo si el insumo está activo y queda en Stock crítico sin alerta vigente); verificar con las pruebas «HU-01 · El pedido deja un insumo activo en su mínimo», «HU-01 · El insumo ya tenía una alerta vigente» y «HU-01 · El pedido deja el stock negativo»

## 3. Servicio de pedidos (registro-ventas)

- [x] 3.1 Implementar `src/servicios/pedidos.ts` (`registrarPedidoConfirmado`, `listarVentas`, `listarAvisosSinReceta`) con la validación y los mensajes de la especificación; verificar con las pruebas de los tres escenarios Gherkin y «HU-01 · Pedido con varios productos»
- [x] 3.2 Verificar los rechazos con las pruebas «HU-01 · Pedido repetido», «HU-01 · Producto inexistente» y «HU-01 · Datos inválidos»

## 4. Pantallas y entrada del pedido

- [x] 4.1 Implementar `src/rutas/pedidos.ts` (`POST /pedidos` formulario y JSON, `GET /simulador`, `GET /ventas`), las vistas `simulador.ejs` y `ventas.ejs`, `express.json()` y `soloAdministrador` para `/ventas` en `app.ts`, y los enlaces en `cabecera.ejs`; verificar con las pruebas «HU-01 · El administrador ve la venta sin receta», «HU-01 · Otro rol intenta ver las ventas», «HU-01 · Simulador de pedidos» y «HU-01 · Pedido confirmado en JSON»

## 5. Integración y documentación

- [x] 5.1 Ejecutar `npm test` y `npm run typecheck` completos (pruebas nuevas y de regresión de HU-06 y HU-07)
- [x] 5.2 Actualizar `README.md` con la historia, las pantallas «Simulador de pedidos» y «Ventas» y el recorrido de demostración; verificar ejecutando los comandos tal como están escritos
