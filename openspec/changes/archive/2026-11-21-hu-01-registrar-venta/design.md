# Design

## Context

- La migración 001 ya creó `pedidos` (numero UNIQUE, fecha_hora, monto_total) y `movimientos_inventario` con el tipo «Descuento» y `pedido_id`; la migración 004 agregó «Ajuste». Falta la clase **Venta** del modelo de dominio (cantidad, monto, sinReceta; Pedido 1 ◆– 1..* Venta; Venta * – 1 Producto).
- `src/dominio/insumo.ts` concentra las transiciones de EST-01 / EST-02 en `aplicarEventoInsumo`; el estado del Insumo se deriva de `activo` y de comparar `stock_actual` con `stock_minimo`. La convención existente guarda la cantidad del Descuento en positivo (prueba de HU-06 «Cambiar una receta no altera los Descuentos anteriores»).
- `src/dominio/receta.ts` ya expone `obtenerReceta`, `obtenerProductoPorNombre` y `cantidadPorUnidad(cantidad, rendimiento)`.
- El Sistema de toma de pedidos es externo (página web de otro curso, S7) y se simula (S4).

## Goals / Non-Goals

**Goals:**
- Procesar un «Pedido confirmado» completo en una sola transacción: Pedido, Ventas, Descuentos, stock y alertas, o nada si se rechaza.
- Un evento `pedidoConfirmado` dentro de la función única de transiciones, con el mismo nombre del evento de EST-01 / EST-02.
- Una sola entrada para el pedido (`POST /pedidos`), usada por el simulador (formulario) y por un sistema externo (JSON).

**Non-Goals:**
- Pantalla de alertas (HU-02), consulta de stock (HU-03), informe (HU-04).
- Anular o modificar pedidos; integración real con la página web.

## Decisions

1. **Migración `005_hu01_ventas.sql`:** tabla `ventas (id, pedido_id → pedidos ON DELETE CASCADE, producto_id → productos, cantidad INTEGER > 0, monto INTEGER ≥ 0, sin_receta INTEGER 0/1)`. Composición Pedido ◆– Venta: una Venta no existe sin su Pedido. La restricción 1..* (al menos una Venta por Pedido) la asegura el servicio, que rechaza pedidos sin productos.

2. **Evento `pedidoConfirmado`** en `aplicarEventoInsumo` con `{ insumoId, cantidad, pedidoId }`:
   - Registra `('Descuento', insumo, ahora, cantidad, pedido)` y deja `stock_actual = stock − cantidad` (redondeado a 3 decimales). Se permite stock negativo (decisión D1).
   - Si el insumo está activo y el estado resultante es «Stock crítico» sin alerta vigente → generar alerta (Stock suficiente → Stock crítico; AlertaDeStock (inicial) → Vigente).
   - Si ya estaba en «Stock crítico» o está «Desactivado» → solo descuenta (transiciones sin cambio de estado, no dibujadas en EST-01).
   - Nunca resuelve alertas: «Pedido confirmado» solo resta stock.

3. **Servicio `src/servicios/pedidos.ts` — `registrarPedidoConfirmado(db, pedido)`:**
   - Lee el pedido: `numero` y `productos[] = { producto, cantidad, monto }` (en JSON) o los campos `producto1..N / cantidad1..N / monto1..N` del formulario (filas vacías se ignoran).
   - Valida en orden: número entero > 0; al menos un producto; cada producto existe (por nombre); cantidad entera > 0; monto entero ≥ 0 en CLP (acepta «7.000» con `leerPesos`); número no registrado. Rechazo → `ErrorDeNegocio('Pedido rechazado (<motivo>)')` (409 si es repetido, 400 en el resto).
   - En una transacción: inserta el Pedido (monto_total = suma de montos), luego por cada producto obtiene la receta; con receta, por cada ingrediente aplica `pedidoConfirmado` con `cantidadPorUnidad(ingrediente, rendimiento) × unidades` e inserta la Venta con `sin_receta = 0`; sin receta, inserta la Venta con `sin_receta = 1` y agrega el aviso.
   - Devuelve `{ mensaje: 'Pedido registrado', avisos: ['Aviso de producto sin receta (Banana Cloud)'] }`.
   - `listarVentas(db)` y `listarAvisosSinReceta(db)` para la pantalla «Ventas».

4. **Rutas `src/rutas/pedidos.ts`:**
   - `POST /pedidos` (DSS-01 «Pedido confirmado»): si la petición es JSON responde JSON `{ mensaje, avisos }` o `{ error }`; si viene del simulador vuelve a mostrar el simulador con el resultado.
   - `GET /simulador`: formulario del Simulador de pedidos con 3 filas (producto, cantidad, monto) y el número sugerido (último + 1). No pasa por `soloAdministrador`: representa al sistema externo, no al módulo de inventario.
   - `GET /ventas`: tabla de ventas y avisos; protegido con `soloAdministrador` (RP-09).
   - `app.ts` agrega `express.json()`.

5. **Cabecera:** enlaces «Ventas» y «Simulador de pedidos».

## Risks / Trade-offs

- [Stock negativo en la demostración, porque los insumos de ejemplo nacen con stock 0] → El README indica cargar stock con «Ajustar stock → Corrección de conteo» antes de enviar un pedido de demostración.
- [Cantidades fraccionarias (1 cucharadita ÷ 10 × 3 = 0,3)] → Se redondea a 3 decimales al guardar, como en HU-07.
- [El simulador no exige rol] → Es intencional: simula un sistema externo; las pantallas del inventario siguen protegidas.

## Migration Plan

1. Al reiniciar el servidor, la migración 005 se aplica sobre `data/app.db`.
2. Para partir de cero: borrar `data/` y ejecutar `npm run db:seed`.
