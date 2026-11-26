# Design

## Context

- `ventas` (migración 005) no tiene estado; los Descuentos guardan `pedido_id`, no la venta. El modelo de dominio (08) ahora dice `Venta.estado` y Descuento * – 1 Venta.
- `aplicarEventoInsumo` (src/dominio/insumo.ts) es la única función de EST-01 / EST-02. EST-03 es nuevo.
- El Sistema de toma de pedidos sigue simulado (S4).

## Goals / Non-Goals

**Goals:** stock nunca negativo por ventas; una función única por diagrama de estado (`aplicarEventoVenta` para EST-03); cada mensaje de DSS-07 es una ruta.

**Non-Goals:** resolver varias ventas a la vez; reservar stock para ventas pendientes.

## Decisions

1. **Migración 006** — `ALTER TABLE ventas ADD COLUMN estado TEXT NOT NULL DEFAULT 'Confirmada' CHECK (estado IN ('Confirmada','Pendiente de confirmación','Cancelada'))` y `ALTER TABLE movimientos_inventario ADD COLUMN venta_id INTEGER REFERENCES ventas (id)`. Backfill: cada Descuento antiguo apunta a la venta de su pedido cuyo producto lleva ese insumo en la receta. Las ventas antiguas quedan «Confirmada».
2. **EST-03 → `aplicarEventoVenta(db, evento)`** en `src/dominio/venta.ts` con los eventos `pedidoConfirmado` (crea la Venta en «Confirmada» o «Pendiente de confirmación» según la guarda), `confirmarVenta` y `cancelarVenta`. Las transiciones no modeladas lanzan `ErrorDeNegocio` 409.
3. **Guarda «hay stock suficiente»** (`faltantesDeReceta`): por insumo, necesario = Σ cantidad ÷ rendimiento × unidades; falta si stock_actual < necesario (SV1). Aplica también a insumos desactivados (SV2).
4. **Varios productos (SV3):** el loop de DSS-01 evalúa cada producto con el stock que dejaron los anteriores; solo la venta que no alcanza queda pendiente. **Todo o nada por venta (SV4):** si falta un insumo no se descuenta ninguno de esa receta.
5. **EST-01 / EST-02:** nuevo evento `confirmarVenta` en `aplicarEventoInsumo`, idéntico a `pedidoConfirmado` en efecto (Descuento con `venta_id`, generar alerta si el insumo activo queda en o bajo el mínimo sin alerta vigente). `pedidoConfirmado` ahora rechaza stock insuficiente como defensa (no debería ocurrir).
6. **Rutas (DSS-07):** «Consultar ventas pendientes de insumos» → `GET /ventas/pendientes`; «Confirmar venta (venta)» → `POST /ventas/:id/confirmar`; «Cancelar venta (venta)» → `POST /ventas/:id/cancelar`. Todas bajo `/ventas`, así que `soloAdministrador` (RP-09) ya las protege. Responden HTML (pantalla con mensaje) o JSON si la petición es JSON.
7. **Mensajes (DSS-01 / DSS-07):** «Aviso de venta pendiente de insumos (<producto>; faltan: <insumo> <cantidad> <unidad>, …)», «Venta confirmada», «Confirmación rechazada (faltan: …)», «Confirmación rechazada (la venta no está pendiente)», «Venta cancelada», «Cancelación rechazada (la venta no está pendiente)».

## Risks / Trade-offs

- Una venta pendiente no reserva stock: si se confirma otra venta antes, puede seguir faltando (CA3 lo cubre).
