# Design

## Context

- `movimientos_inventario` (migración 001) implementa la herencia de `MovimientoDeInventario` en una sola tabla con `tipo IN ('Descuento', 'Reposición')`, `cantidad`, `fecha`, `pedido_id` y `responsable`. El modelo de dominio ya incluye `Ajuste` (motivo, responsable), pero la tabla no admite ese tipo ni tiene `motivo`.
- `src/dominio/insumo.ts` concentra todas las transiciones de EST-01 / EST-02 en `aplicarEventoInsumo`; el estado del Insumo se deriva de `activo` y de comparar `stock_actual` con `stock_minimo`.
- `stock_actual` es un valor guardado en `insumos` (las reposiciones de ejemplo lo actualizan junto con su movimiento).
- El rol de demostración está en `res.locals.rol` (middleware de `src/rutas/rol.ts`); `soloAdministrador` protege las rutas del inventario.

## Goals / Non-Goals

**Goals:**
- Un evento `ajustar` dentro de la función única de transiciones, que actualiza el stock, registra el movimiento y aplica las transiciones de EST-01 / EST-02 en una sola transacción.
- Pantalla `/ajustes` siguiendo el patrón de las existentes (EJS + formulario POST + redirección 303 con `?ok=`).

**Non-Goals:**
- Recalcular `stock_actual` como suma de movimientos (se mantiene el valor guardado).
- Editar o anular ajustes; paginar o filtrar la lista.

## Decisions

1. **Migración `004_hu07_ajuste_stock.sql`:** SQLite no permite cambiar un `CHECK`, así que se reconstruye la tabla: crear `movimientos_inventario_nueva` con `tipo IN ('Descuento', 'Reposición', 'Ajuste')`, columna `motivo TEXT CHECK (motivo IS NULL OR motivo IN ('Merma', 'Corrección de conteo'))` y un `CHECK` que exige motivo solo cuando `tipo = 'Ajuste'`; copiar las filas, borrar la tabla vieja y renombrar. Se desactivan temporalmente las claves foráneas durante la migración (`PRAGMA foreign_keys` se maneja en `aplicarMigraciones`, que ya corre cada archivo con `db.exec`). Alternativa descartada: una tabla `ajustes` aparte; rompería la herencia en una tabla y la regla «tiene movimientos» de HU-06.

2. **Evento `ajustar`** en `aplicarEventoInsumo` con `{ insumoId, motivo, cantidad, responsable }`:
   - Merma: `resultante = stock − cantidad`; exige `cantidad > 0` y `resultante ≥ 0`.
   - Corrección de conteo: exige `cantidad ≥ 0`; `resultante = cantidad`.
   - Registra `('Ajuste', insumo, ahora, resultante − stock, NULL, responsable, motivo)` y actualiza `stock_actual`.
   - Si el insumo está activo: estado resultante «Stock crítico» sin alerta vigente → generar alerta; «Stock suficiente» → resolver alerta vigente. Desactivado: sin alertas.
   - Las reglas de negocio lanzan `ErrorDeNegocio` con los mensajes de la especificación.

3. **Servicio `src/servicios/ajustes.ts`:** lee el formulario (insumo, motivo, cantidad con `leerNumero`, que acepta coma o punto decimal), valida el dato faltante y llama al evento; expone `listarAjustes` (JOIN con insumos, del más reciente al más antiguo) para la tabla.

4. **Pantalla `/ajustes`** (`src/rutas/ajustes.ts`, `src/vistas/ajustes.ejs`): `GET /ajustes` (formulario + lista) y `POST /ajustes` (registra y redirige con «Ajuste registrado (stock actualizado: N unidad)»; ante un rechazo, vuelve a mostrar la pantalla con el motivo y los datos escritos, código 400). Se agrega `/ajustes` a `soloAdministrador` en `app.ts` y el enlace «Ajustar stock» en la cabecera. Las cantidades se muestran sin decimales sobrantes (1700, 0.5) y con signo en la lista (+200, -300, 0).

5. **Responsable:** el rol de demostración activo (`res.locals.rol`), que solo puede ser «Administrador» porque la ruta está protegida.

## Risks / Trade-offs

- [Reconstruir la tabla de movimientos en una base con datos] → La migración copia todas las filas con sus ids; la prueba de migración verifica que la Reposición de la canela se conserva.
- [Decimales de punto flotante en cantidades (0,1 + 0,2)] → Se redondea el stock resultante a 3 decimales al guardar.
- [El selector muestra stock, que es tema de HU-03] → Decisión D2 confirmada: solo dentro del selector y en el mensaje; no hay una vista de stock aparte.

## Migration Plan

1. Al reiniciar el servidor, la migración 004 se aplica sobre `data/app.db`.
2. Para partir de cero: borrar `data/` y ejecutar `npm run db:seed`.
