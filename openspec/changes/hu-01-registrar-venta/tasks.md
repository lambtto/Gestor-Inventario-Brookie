# Tasks

## 1. Datos

- [x] 1.1 Crear `src/db/migrations/005_hu01_ventas.sql` con la tabla `ventas` (pedido, producto, cantidad > 0, monto ≥ 0, sin_receta). Verificar: `npm test` sigue en verde y una base nueva tiene la tabla.

## 2. Lógica del dominio

- [x] 2.1 Agregar el evento `descontar` a `aplicarEventoInsumo` en `src/dominio/insumo.ts` (resta sin límite inferior, Descuento con cantidad positiva y pedido, alerta solo si el insumo está activo, en crítico y sin alerta vigente). Verificar: `npm run typecheck`.
- [x] 2.2 Crear `src/dominio/pedido.ts` con `procesarPedidoConfirmado(db, lineas)` (validación, Pedido con número correlativo y total, una Venta por línea, descuentos según receta, venta «sin receta») en una sola transacción, y consultas `listarPedidos` / `listarAvisosSinReceta`. Verificar: `npm run typecheck`.

## 3. Pantallas

- [x] 3.1 Crear `src/servicios/pedidos.ts` (lee las 5 filas del formulario, ignora las vacías, convierte cantidad y monto) y la pantalla «Simulador de pedidos» (`src/rutas/simulador.ts`, `src/vistas/simulador.ejs`) para cualquier rol. Verificar: `GET /simulador` con rol Caja responde 200.
- [x] 3.2 Crear la pantalla «Ventas» (`src/rutas/ventas.ts`, `src/vistas/ventas.ejs`) con avisos, pedidos, ventas y descuentos; registrar `/ventas` en `soloAdministrador` y ambas rutas en `app.ts`; agregar los enlaces a `cabecera.ejs`. Verificar: `GET /ventas` como Administrador responde 200 y como Barista 403.

## 4. Pruebas (una por escenario)

- [x] 4.1 `tests/hu01-ventas.test.ts`, escenarios Gherkin: «Pedido confirmado cuyos productos tienen receta», «Pedido con un producto sin receta», «Pedido que usa un insumo desactivado». Verificar: `npm test`.
- [x] 4.2 Mismo archivo, escenarios de la especificación: pedido del simulador con número y total, pedido con datos inválidos (nada registrado), stock negativo, alerta generada por pedido, sin segunda alerta, el administrador ve el pedido en «Ventas», Barista sin acceso a «Ventas». Verificar: `npm test` y `npm run typecheck` en verde.

## 5. Documentación

- [x] 5.1 Actualizar `README.md`: pantallas «Simulador de pedidos» y «Ventas», y un recorrido manual (ajustar stock de mantequilla, enviar 2 Lemon Empire, enviar 1 Banana Cloud sin receta, revisar «Ventas» e «Insumos»). Verificar: los pasos del README funcionan con `npm run db:seed` y `npm run dev`.

## Workflow follow-up

- Validar el sistema con `/cin324-validar-sistema`.
- Archivar el cambio con `/opsx:archive` y actualizar `.cin324/proyecto.md`.
