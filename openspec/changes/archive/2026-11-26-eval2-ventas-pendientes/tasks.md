# Tareas: Evaluación 2 — Ventas pendientes de insumos (HU-01 CA7, HU-08)

## 1. Datos

- [x] 1.1 Crear `src/db/migrations/006_eval2_ventas_pendientes.sql` (`ventas.estado` con CHECK, `movimientos_inventario.venta_id`, backfill); verificar con «HU-08 · Esquema de Venta con estado»

## 2. Dominio (EST-03, EST-01 / EST-02)

- [x] 2.1 Crear `src/dominio/venta.ts` con `aplicarEventoVenta` (pedidoConfirmado, confirmarVenta, cancelarVenta) y `faltantesDeReceta`
- [x] 2.2 Agregar el evento `confirmarVenta` a `aplicarEventoInsumo` y guardar `venta_id` en el Descuento; `pedidoConfirmado` rechaza stock insuficiente

## 3. Servicios

- [x] 3.1 `registrarPedidoConfirmado` usa `aplicarEventoVenta` y emite el aviso de venta pendiente; verificar con «HU-01 · Pedido que excede los insumos existentes», «HU-01 · Pedido con un producto que alcanza y otro que no» e «HU-01 · Insumo desactivado que no alcanza»; reemplazar la prueba «HU-01 · El pedido deja el stock negativo»
- [x] 3.2 `src/servicios/ventas.ts`: `listarVentasPendientes`, `confirmarVentaPendiente`, `cancelarVentaPendiente`; verificar con los escenarios de HU-08

## 4. Pantallas

- [x] 4.1 `src/rutas/ventas.ts` (`GET /ventas/pendientes`, `POST /ventas/:id/confirmar`, `POST /ventas/:id/cancelar`), vista `ventas-pendientes.ejs`, columna Estado en `ventas.ejs`, enlace en `cabecera.ejs`; verificar con «HU-08 · Solo el administrador resuelve ventas pendientes» y «HU-08 · Confirmar desde la pantalla»

## 5. Integración y documentación

- [x] 5.1 `npm test` y `npm run typecheck` en verde
- [x] 5.2 Actualizar README, `12-trazabilidad.md` (fila de implementación) y `.cin324/proyecto.md`
