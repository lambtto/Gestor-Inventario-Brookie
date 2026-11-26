# Proposal

## Why

Cambio de requerimientos de la Evaluación 2 (especificado en clase el 24/11, `Evaluacion2.md`). Hasta ahora un pedido confirmado descontaba los insumos aunque el stock quedara negativo (decisión D1 de HU-01). El dueño quiere que el stock solo baje cuando de verdad se puede preparar el producto: si no alcanza, la venta queda pendiente y él decide después si la confirma o la cancela.

Origen: **HU-01 CA7** y **HU-08 Resolver venta pendiente de insumos** (ficha `.cin324/historias/HU-08.md`), requisitos **RP-15** (nuevo) y **RP-01** (modificado), casos de uso **CU-01** (variante), **CU-12**, **CU-13**, **CU-14**, diagramas **DSS-01** y **DSS-07**, estados **EST-03** (nuevo), **EST-01** y **EST-02** (evento «Confirmar venta»).

## What Changes

- **BREAKING (D1):** un producto con receta al que le falta stock de algún insumo ya no deja stock negativo: su Venta queda «Pendiente de confirmación», no se descuenta nada y se avisa al Administrador.
- `Venta.estado` («Confirmada», «Pendiente de confirmación», «Cancelada») y Descuento asociado a la Venta (migración 006).
- Pantalla **«Ventas pendientes»** (`GET /ventas/pendientes`) con pedido, producto, cantidad e insumos que faltan (CU-12).
- **Confirmar** (`POST /ventas/:id/confirmar`, CU-13): descuenta y deja la venta Confirmada solo si hay stock; si no, se rechaza.
- **Cancelar** (`POST /ventas/:id/cancelar`, CU-14).
- La pantalla «Ventas» muestra el estado de cada venta.

**Fuera del alcance:** confirmar varias ventas a la vez, editar ventas, avisos por correo, informe (HU-04), integración real con la página web de pedidos.

## Capabilities

### New Capabilities
- `ventas-pendientes`: consultar, confirmar y cancelar ventas pendientes de insumos (HU-08, EST-03).

### Modified Capabilities
- `registro-ventas`: el pedido confirmado deja pendiente la venta cuyo stock no alcanza (HU-01 CA7) en vez de dejar stock negativo; la pantalla «Ventas» muestra el estado.

## Impact

- `src/db/migrations/006_eval2_ventas_pendientes.sql` (nueva), `src/dominio/venta.ts` (nuevo), `src/dominio/insumo.ts`, `src/servicios/pedidos.ts`, `src/servicios/ventas.ts` (nuevo), `src/rutas/pedidos.ts`, `src/rutas/ventas.ts` (nuevo), vistas `ventas.ejs`, `ventas-pendientes.ejs` (nueva), `cabecera.ejs`.
- Pruebas: `tests/hu01-ventas.test.ts` (se reemplaza «El pedido deja el stock negativo»), `tests/hu08-ventas-pendientes.test.ts` (nueva).
