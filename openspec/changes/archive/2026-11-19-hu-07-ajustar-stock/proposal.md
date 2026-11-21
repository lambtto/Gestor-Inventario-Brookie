# Proposal

## Why

Hoy el stock de un insumo solo cambia por pedidos (HU-01) o por ingresos de compra (HU-05). Cuando se pierde un insumo (vencido, derramado o dañado) o el conteo físico no coincide con el sistema, el administrador no tiene cómo corregirlo, y el inventario deja de reflejar lo que hay en el local. La necesidad apareció en la validación de la HU-06 (OBS-4c) y quedó especificada en RP-14 y la HU-07.

Origen: **HU-07 Ajustar stock** (ficha `.cin324/historias/HU-07.md`), actividad del TO-BE **N07 — Ajustar stock**, caso de uso **CU-11 Ajustar stock (merma o corrección de conteo)**, diagrama de secuencia **DSS-06**.

## What Changes

- Nueva pantalla **«Ajustar stock»** (`/ajustes`, en el menú, solo Administrador) con un formulario: insumo (el selector muestra el stock actual), motivo («Merma» o «Corrección de conteo») y cantidad.
- **Merma:** resta la cantidad perdida (debe ser > 0 y no mayor que el stock actual).
- **Corrección de conteo:** deja el stock en la cantidad contada (≥ 0) y registra la diferencia, positiva, negativa o 0.
- Cada ajuste queda registrado como movimiento de inventario **Ajuste** con fecha, cantidad con signo, motivo y responsable (RP-08), y se lista debajo del formulario.
- Si el insumo está activo, el ajuste genera la alerta de stock crítico cuando el stock queda en o bajo el mínimo, y la resuelve cuando queda sobre el mínimo (EST-01, EST-02). Un insumo desactivado se ajusta sin alertas.

**Fuera del alcance:** consultar stock y alertas como pantallas propias (HU-03, HU-02); ingresos por compra (HU-05); descuentos por pedido (HU-01); informe (HU-04); editar o anular un ajuste registrado; requisitos no funcionales (RP-10 a RP-13); autenticación real.

## Capabilities

### New Capabilities
- `ajuste-stock`: registrar ajustes de stock de un insumo por merma o por corrección de conteo, con su movimiento de inventario y el efecto sobre el estado del insumo y su alerta.

### Modified Capabilities
<!-- Ninguna: los requisitos de gestion-insumos no cambian. Un insumo con ajustes registrados ya queda protegido contra eliminación por la regla existente «Proteger insumos utilizados» (tiene movimientos de inventario). -->

## Impact

- Base de datos: migración `004_hu07_ajuste_stock.sql` (la tabla `movimientos_inventario` admite el tipo «Ajuste» y una columna `motivo`).
- Dominio: nuevo evento `ajustar` en la función única de transiciones de EST-01 / EST-02 (`src/dominio/insumo.ts`).
- Nuevos `src/servicios/ajustes.ts`, `src/rutas/ajustes.ts` y `src/vistas/ajustes.ejs`; enlace «Ajustar stock» en la cabecera; RP-09 aplicado a `/ajustes`.
- Pruebas: `tests/hu07-ajustes.test.ts` (un caso por escenario Gherkin y por variante).
- README: pantalla nueva.
