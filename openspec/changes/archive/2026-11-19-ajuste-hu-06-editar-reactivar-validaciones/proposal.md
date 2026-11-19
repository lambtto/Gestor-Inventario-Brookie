# Proposal

## Why

En la validación de la HU-06 (2026-11-19) el estudiante detectó que un insumo desactivado no se puede reactivar, que los insumos no se pueden editar, que se aceptan nombres sin letras (por ejemplo «123»), que el costo no está expresado en pesos chilenos y que el registro no se abre en una ventana emergente. Los artefactos ya se actualizaron y aprobaron (commit `f73f1e2`): RP-06 ampliado, HU-06 CA5–CA8 con seis escenarios Gherkin nuevos, CU-09 y CU-10, y EST-01 / EST-02 con las transiciones de reactivar y editar. Este cambio lleva esos artefactos al sistema.

Origen: **HU-06 Registrar insumos y recetas** (ficha `.cin324/historias/HU-06.md`), actividad del TO-BE **N05 — Registrar insumos y recetas**, casos de uso **CU-06 Registrar insumo** (modificado), **CU-09 Editar insumo** y **CU-10 Reactivar insumo** (nuevos).

## What Changes

- **Registrar insumo (CU-06):** el nombre debe contener al menos una letra; el costo unitario debe ser un número entero de pesos chilenos (CLP) mayor o igual a 0. El formulario se abre en una ventana emergente centrada sobre la lista; ante un rechazo, la ventana vuelve a abrirse con el motivo y los datos escritos.
- **Editar insumo (CU-09, nuevo):** el administrador puede cambiar nombre, unidad de medida, costo unitario y stock mínimo de cualquier insumo (activo o desactivado), con las mismas reglas del registro. Si el insumo está activo, el nuevo mínimo recalcula su estado y su alerta (EST-01, EST-02).
- **Reactivar insumo (CU-10, nuevo):** un insumo desactivado vuelve a estar activo y disponible para recetas nuevas; si su stock está en o bajo el mínimo, se genera una alerta de stock crítico vigente nueva.
- **Lista de insumos:** muestra el costo con formato CLP (por ejemplo, $1.250) y agrega las acciones «Editar» y «Reactivar» (esta última en lugar de «Desactivar» para los insumos desactivados).
- **Datos:** migración que redondea al entero los costos ya guardados; los costos de ejemplo pasan a enteros (azúcar blanca $2, harina con polvos $1, sal $1, leche $1, agua fría $0).

**Fuera del alcance:** ajustar stock por merma o corrección de conteo (HU-07, CU-11, DSS-06, clase `Ajuste`); registrar ingresos (HU-05); ver stock y alertas (HU-03, HU-02); descontar por pedidos (HU-01); informe (HU-04); convertir las cantidades de las recetas cuando cambia la unidad de medida de un insumo; requisitos no funcionales (RP-10 a RP-13); autenticación real.

## Capabilities

### New Capabilities
<!-- Ninguna: editar y reactivar insumos pertenecen a la capacidad existente gestion-insumos. -->

### Modified Capabilities
- `gestion-insumos`: cambian los requisitos «Registrar insumo» (CLP, ventana emergente), «Validar datos del insumo» (nombre con al menos una letra, costo entero) y «Listar insumos» (formato CLP, acciones Editar y Reactivar); se agregan «Editar insumo», «Recalcular alerta al editar el stock mínimo», «Reactivar insumo» y «Formulario de insumo en ventana emergente».

## Impact

- Dominio `src/dominio/insumo.ts`: nuevos eventos `editar` y `reactivar` en la función única de transiciones EST-01 / EST-02.
- Servicio `src/servicios/insumos.ts`: validación del nombre y del costo entero, editar y reactivar, mensajes nuevos.
- Rutas `src/rutas/insumos.ts`: `POST /insumos/:id/editar` y `POST /insumos/:id/reactivar`.
- Vista `src/vistas/insumos.ejs` (y estilos en la cabecera): ventana emergente `<dialog>` para registrar y editar, formato CLP, botones nuevos.
- Base de datos: migración `002_hu06_ajuste_costo_clp.sql`; datos de ejemplo en `src/db/seed.ts`.
- Pruebas: nuevo `tests/hu06-ajuste.test.ts` (un caso por escenario Gherkin nuevo) y ajuste del escenario de registro existente.
- Sin dependencias nuevas ni integraciones externas.
