# Proposal

## Why

Hoy (AS-IS, A06) el dueño anota a mano en Excel, al cierre del día, las ventas y la rebaja de insumos, así que el stock nunca está al día y no hay trazabilidad entre lo vendido y lo consumido. Con los insumos y las recetas ya registrados (HU-06), el gestor puede calcular solo, con la receta, cuánto consume cada pedido confirmado.

Origen: **HU-01 Registrar venta** (ficha `.cin324/historias/HU-01.md`), actividad del TO-BE **N01 — Descontar insumos y registrar venta** (tarea de servicio), caso de uso **CU-01 Registrar venta y descontar insumos**, diagramas de secuencia **DSS-01** y **DSS-02**, requisitos RP-01, RP-02, RP-08 y RP-09.

## What Changes

- Nueva pantalla **«Simulador de pedidos»** (`/simulador`, en el menú, disponible para cualquier rol) que reemplaza al Sistema de toma de pedidos (página web de la cafetería, S4/S7): arma un pedido con una o más líneas (producto, cantidad, monto en CLP) y lo envía como «Pedido confirmado». Responde «Pedido N° X registrado».
- Al recibir un **Pedido confirmado**, el gestor, sin intervención del administrador:
  - registra el **Pedido** (número correlativo, fecha y hora, monto total = suma de las líneas);
  - registra una **Venta** por línea (producto, cantidad, monto, sin receta sí/no);
  - si el producto tiene receta, descuenta cada insumo (cantidad del ingrediente × unidades ÷ rendimiento) y registra un **Descuento** con fecha, cantidad y pedido asociado (RP-08);
  - si el producto no tiene receta, marca la venta «sin receta», no descuenta y deja un aviso para el administrador (CA5);
  - si un insumo activo queda en o bajo su mínimo y no tenía alerta vigente, genera la **alerta de stock crítico** (EST-01, EST-02, DSS-02); un insumo desactivado se descuenta sin alerta (CA6).
- El descuento por pedido **puede dejar el stock negativo** (decisión A de la ficha).
- Nueva pantalla **«Ventas»** (`/ventas`, en el menú, solo Administrador): avisos de producto sin receta y la lista de pedidos con sus ventas y descuentos.

**Fuera del alcance:** consultar las alertas (HU-02), consultar stock (HU-03), informe (HU-04), registrar ingresos (HU-05); anular o editar pedidos o ventas; integración real con la página web de pedidos; requisitos no funcionales (RP-10 a RP-13); autenticación real.

## Capabilities

### New Capabilities
- `registro-ventas`: procesar un pedido confirmado registrando el pedido, sus ventas y los descuentos de insumos según la receta, con el efecto sobre el estado del insumo y su alerta; el simulador del sistema de toma de pedidos y la consulta de ventas del administrador.

### Modified Capabilities
<!-- Ninguna: los requisitos de gestion-insumos, recetas-productos, ajuste-stock y acceso-por-rol no cambian. La restricción de /ventas al Administrador se especifica dentro de registro-ventas, como hizo ajuste-stock. Un insumo con Descuentos ya queda protegido contra eliminación por la regla existente «tiene movimientos». -->

## Impact

- Base de datos: migración `005_hu01_ventas.sql` (tabla `ventas`; la tabla `pedidos` de la migración 001 ya existe).
- Dominio: nuevo evento `descontar` en la función única de transiciones de EST-01 / EST-02 (`src/dominio/insumo.ts`) y nuevo `src/dominio/pedido.ts`.
- Nuevos `src/servicios/pedidos.ts`, `src/rutas/simulador.ts`, `src/rutas/ventas.ts`, `src/vistas/simulador.ejs`, `src/vistas/ventas.ejs`; enlaces en la cabecera; RP-09 aplicado a `/ventas`.
- Pruebas: `tests/hu01-ventas.test.ts` (un caso por escenario Gherkin y por variante).
- README: pantallas nuevas y recorrido de prueba.
