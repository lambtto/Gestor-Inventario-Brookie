# Design

## Context

- `movimientos_inventario` ya admite el tipo «Reposición» con `responsable` (migraciones 001 y 004); los datos de ejemplo ya registran una Reposición de canela. No hace falta migración.
- `src/dominio/insumo.ts` concentra las transiciones de EST-01 / EST-02 en `aplicarEventoInsumo`; el estado del Insumo se deriva de `activo` y de comparar `stock_actual` con `stock_minimo`.
- HU-07 dejó el patrón de pantalla a seguir: `GET` formulario + lista, `POST` que redirige con `?ok=` (303) o vuelve a mostrar la pantalla con el motivo del rechazo (400).

## Goals / Non-Goals

**Goals:**
- Un evento `registrarIngreso` dentro de la función única de transiciones, con el nombre del evento «Registrar ingreso» de EST-01 / EST-02.
- Pantalla `/ingresos` con el mismo patrón que `/ajustes`.

**Non-Goals:**
- Proveedores, precios de compra o facturas; cambiar el costo unitario; anular reposiciones.

## Decisions

1. **Evento `registrarIngreso`** en `aplicarEventoInsumo` con `{ insumoId, cantidad, responsable }`:
   - Insumo Desactivado → `ErrorDeNegocio('Ingreso rechazado (insumo desactivado)')`: la transición no está modelada en EST-01 (decisión D2).
   - Exige `cantidad > 0`.
   - Registra `('Reposición', insumo, ahora, cantidad, responsable)` y deja `stock_actual = stock + cantidad` (redondeado a 3 decimales).
   - Si el estado resultante es «Stock suficiente» → resolver la alerta vigente (Stock crítico → Stock suficiente; Vigente → Resuelta). Si sigue en «Stock crítico», la alerta se mantiene.

2. **Servicio `src/servicios/ingresos.ts`:** `registrarIngreso(db, form, responsable)` lee insumo y cantidad (con `leerNumero`, coma o punto decimal), valida en el orden del DSS-03 (falta el insumo, falta la cantidad, cantidad no válida) y aplica el evento; devuelve «Ingreso registrado (stock actualizado: N unidad)». `listarReposiciones(db)` para la tabla (JOIN con insumos, de la más reciente a la más antigua).

3. **Pantalla `/ingresos`** (`src/rutas/ingresos.ts`, `src/vistas/ingresos.ejs`): `GET /ingresos` y `POST /ingresos`; se agrega `/ingresos` a `soloAdministrador` en `app.ts` y el enlace «Registrar ingreso» en la cabecera. El selector solo ofrece insumos activos y muestra su stock actual.

4. **Responsable:** el rol de demostración activo (`res.locals.rol`), que solo puede ser «Administrador» porque la ruta está protegida.

## Risks / Trade-offs

- [El ingreso de un insumo desactivado podría parecer útil] → Se rechaza para respetar EST-01; si el equipo decide permitirlo, primero debe agregarse la transición al diagrama.
- [Decimales de punto flotante] → Se redondea a 3 decimales al guardar, como en HU-07 y HU-01.

## Migration Plan

Sin migración. Basta reiniciar el servidor.
