# Proposal

## Why

Cuando el administrador compra y guarda insumos (A12 del AS-IS), no queda ningún registro: el stock del gestor no sube y las alertas de stock crítico siguen vigentes aunque el insumo ya se haya repuesto. Hoy la única forma de subir el stock es una «Corrección de conteo» (HU-07), que no deja constancia de que fue una compra.

Origen: **HU-05 Registrar ingreso de stock** (ficha `.cin324/historias/HU-05.md`), actividad del TO-BE **N04 — Reabastecer stock** (tarea de usuario), caso de uso **CU-05 Registrar ingreso de stock**, diagrama de secuencia **DSS-03**, diagramas de estado **EST-01** y **EST-02** (evento «Registrar ingreso»).

## What Changes

- Nueva pantalla **«Registrar ingreso»** (`/ingresos`, en el menú, solo Administrador) con un formulario: insumo (el selector muestra el stock actual) y cantidad recibida en su unidad de medida.
- El ingreso aumenta el stock del insumo y queda registrado como movimiento de inventario **Reposición** con fecha, cantidad y responsable (RP-05, RP-08). La pantalla lista las reposiciones registradas.
- Si el insumo estaba en Stock crítico y el ingreso deja su stock sobre el mínimo, su alerta vigente queda **resuelta** (EST-01, EST-02).
- Se rechaza el ingreso sin cantidad, sin insumo, con una cantidad que no es mayor que 0 o de un insumo desactivado.

**Fuera del alcance:** proveedores, precios o facturas de la compra; modificar el costo unitario al reponer; anular o editar una reposición; pantalla de alertas (HU-02); requisitos no funcionales (RP-12, RP-13); autenticación real.

## Capabilities

### New Capabilities
- `ingreso-stock`: registrar el ingreso de un insumo comprado como Reposición, con su efecto sobre el estado del insumo y su alerta.

### Modified Capabilities
<!-- Ninguna. -->

## Impact

- Base de datos: sin migración (el tipo «Reposición» y la columna `responsable` ya existen en `movimientos_inventario`).
- Dominio: nuevo evento `registrarIngreso` en la función única de transiciones de EST-01 / EST-02 (`src/dominio/insumo.ts`).
- Nuevos `src/servicios/ingresos.ts`, `src/rutas/ingresos.ts` y `src/vistas/ingresos.ejs`; enlace «Registrar ingreso» en la cabecera; RP-09 aplicado a `/ingresos`.
- Pruebas: `tests/hu05-ingresos.test.ts`.
- README: pantalla nueva.
