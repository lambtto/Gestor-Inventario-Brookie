# Proposal

## Why

Hoy el gestor conoce insumos, recetas y ajustes, pero un pedido confirmado no cambia nada: el stock no baja y la venta no queda registrada, así que el administrador seguiría anotando a mano la rebaja de insumos y las ventas al cierre del día (A06 del AS-IS). Es el problema central que el dueño quiere resolver.

Origen: **HU-01 Registrar venta** (ficha `.cin324/historias/HU-01.md`), actividad del TO-BE **N01 — Descontar insumos y registrar venta** (tarea de servicio), caso de uso **CU-01 Registrar venta y descontar insumos**, diagramas de secuencia **DSS-01** y **DSS-02** (primera parte), diagramas de estado **EST-01** y **EST-02** (evento «Pedido confirmado»).

## What Changes

- El gestor recibe un **«Pedido confirmado»** del Sistema de toma de pedidos en `POST /pedidos` (formulario o JSON) con el número, y por cada producto su cantidad y monto.
- Por cada producto **con receta**, descuenta de cada insumo la cantidad de la receta ÷ rendimiento × unidades, registra un **Descuento** por insumo (fecha, cantidad, pedido) y registra la **Venta**.
- Por cada producto **sin receta**, registra la Venta marcada **sin receta**, no descuenta insumos y emite **«Aviso de producto sin receta»** al Administrador.
- Si un insumo **activo** queda en o bajo su mínimo y no tenía alerta vigente, se genera la **alerta de stock crítico** (EST-01 / EST-02). Un insumo **desactivado** se descuenta igual, sin alerta.
- Se rechaza un pedido con datos faltantes o inválidos, con un producto inexistente o con un número ya registrado.
- **Simulador de pedidos** (`/simulador`) que hace de Sistema de toma de pedidos (S4).
- Pantalla **«Ventas»** (`/ventas`, solo Administrador) con las ventas y los avisos de producto sin receta.

**Fuera del alcance:** consulta de alertas como pantalla propia (HU-02); consulta de stock (HU-03); informe y ganancia (HU-04); reposiciones (HU-05); anular o modificar un pedido registrado; integración real con la página web de pedidos; requisitos no funcionales (RP-10, RP-11); autenticación real.

## Capabilities

### New Capabilities
- `registro-ventas`: recibir un pedido confirmado, registrar sus ventas, descontar los insumos según la receta con su Descuento y aplicar el evento «Pedido confirmado» al estado del insumo y su alerta.

### Modified Capabilities
<!-- Ninguna. acceso-por-rol ya define la regla «solo Administrador» y se aplica también a /ventas. -->

## Impact

- Base de datos: migración `005_hu01_ventas.sql` (tabla `ventas`; `pedidos` ya existe desde la migración 001).
- Dominio: nuevo evento `pedidoConfirmado` en la función única de transiciones de EST-01 / EST-02 (`src/dominio/insumo.ts`).
- Nuevos `src/servicios/pedidos.ts`, `src/rutas/pedidos.ts`, `src/vistas/simulador.ejs` y `src/vistas/ventas.ejs`; enlaces «Simulador de pedidos» y «Ventas» en la cabecera; RP-09 aplicado a `/ventas`.
- Pruebas: `tests/hu01-ventas.test.ts` (un caso por escenario Gherkin y por variante).
- README: historia y pantallas nuevas.
