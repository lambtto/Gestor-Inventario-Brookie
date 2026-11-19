# Design

## Context

La HU-06 ya está implementada (cambio archivado `2026-11-19-hu-06-registrar-insumos-recetas`). Lo que importa para este ajuste:

- `src/dominio/insumo.ts` concentra las transiciones de EST-01 / EST-02 en una sola función, `aplicarEventoInsumo`, con los eventos `registrar`, `desactivar` y `eliminar`. El estado del Insumo **no se guarda**: se deriva de `activo` y de comparar `stock_actual` con `stock_minimo`.
- `src/servicios/insumos.ts` valida el formulario (`validarInsumo`) y expone los mensajes en `MENSAJES_INSUMO`. Hoy acepta costos con decimales y un único mensaje para costo y mínimo inválidos.
- `src/rutas/insumos.ts` renderiza `insumos.ejs` con `ok`, `error` y `form`; las acciones son formularios `POST` con redirección 303.
- La tabla `insumos` guarda `costo_unitario` como `REAL`; los datos de ejemplo tienen cinco costos con decimales.
- No hay diagrama de secuencia para editar ni reactivar: el flujo sale del Gherkin, CA8 y EST-01 (confirmado en la ficha).

## Goals / Non-Goals

**Goals:**
- Agregar los eventos `editar` y `reactivar` a la función única de transiciones, cubriendo exactamente las filas nuevas de EST-01 / EST-02.
- Reglas de nombre y costo CLP compartidas entre registrar y editar.
- Ventana emergente para registrar y editar, que funcione sin dependencias nuevas.

**Non-Goals:**
- Convertir cantidades de recetas cuando cambia la unidad de medida (decisión G: no se convierten).
- Cambiar el tipo de columna de `costo_unitario` (ver Decisión 4).
- Mostrar stock o alertas en la pantalla (HU-03, HU-02).

## Decisions

1. **Dos eventos nuevos en `aplicarEventoInsumo`** (`editar` con los datos validados, `reactivar`). Mantiene un único lugar donde viven las transiciones de los diagramas de estado.
   - `editar`: actualiza los cuatro datos; si el insumo está activo, recalcula: estado resultante «Stock crítico» sin alerta vigente → generar alerta; «Stock suficiente» → resolver alerta vigente. Si está desactivado, solo actualiza datos.
   - `reactivar`: exige `activo = 0` (si no, «El insumo ya está activo»); pone `activo = 1` y genera alerta si `stock ≤ mínimo`.
   - Alternativa descartada: hacer los UPDATE directamente en el servicio; dispersaría la lógica de EST-01.

2. **Validación compartida** `validarInsumo(db, form, { excluirId? })`: el nombre debe cumplir `/\p{L}/u` (al menos una letra en cualquier alfabeto, se permiten dígitos y símbolos); el costo debe ser un entero ≥ 0 escrito solo con dígitos (se acepta el punto de miles «1.250», no se aceptan coma ni decimales); el mínimo sigue aceptando decimales ≥ 0. La unicidad del nombre excluye al propio insumo al editar. Los mensajes nuevos se separan por causa (nombre sin letras, costo no entero, mínimo inválido); el prefijo es «Registro rechazado» o «Edición rechazada» según la operación.

3. **Ventana emergente con `<dialog>` nativo de HTML** abierto con `showModal()` (el navegador lo centra y oscurece la lista). Un solo `<dialog>` sirve para registrar y editar: un pequeño script en la vista cambia el título, el `action` del formulario (`/insumos` o `/insumos/:id/editar`) y rellena los campos desde atributos `data-*` de la fila. Ante un rechazo, el servidor vuelve a renderizar la página con el diálogo marcado para abrirse (`data-abrir`), con el mensaje y los datos escritos. Alternativa descartada: una librería de modales; agrega una dependencia para algo que el navegador ya trae.

4. **Costo en CLP sin cambiar el esquema:** la columna `REAL` admite enteros; se agrega la migración `002_hu06_ajuste_costo_clp.sql` con `UPDATE insumos SET costo_unitario = ROUND(costo_unitario)` (azúcar blanca 1,5 → 2; harina 1,2 → 1; sal 0,5 → 1; leche 1,2 → 1; agua fría 0,01 → 0, como en la decisión L) y la regla de entero se aplica en la validación. Alternativa descartada: recrear la tabla con `INTEGER` y `CHECK`; en SQLite exige copiar la tabla y las claves foráneas, con más riesgo y sin beneficio observable.

5. **Formato CLP** con `Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 })` antepuesto con «$» (1250 → «$1.250»), en una función de formato que usa la vista.

6. **Rutas nuevas**, siguiendo el patrón de las existentes (POST + redirección 303 con `?ok=`): `POST /insumos/:id/editar` (CU-09) y `POST /insumos/:id/reactivar` (CU-10). Ambas pasan por el control de rol de demostración ya existente (RP-09).

7. **Pruebas:** archivo nuevo `tests/hu06-ajuste.test.ts`, un caso por cada escenario de la delta spec, con base en memoria preparada por escenario (SH4). Se actualiza el escenario «Costo negativo» existente por su mensaje nuevo, y la prueba de datos de ejemplo verifica que todos los costos son enteros.

## Risks / Trade-offs

- [Cambiar la unidad de un insumo usado en recetas deja cantidades con otra unidad] → Es la decisión G del estudiante; no se agrega ninguna advertencia porque no está en los artefactos (si se quiere, se pide con `/cin324-validar-sistema`).
- [«1.250» podría confundirse con un decimal] → Solo se acepta el punto si separa grupos exactos de tres dígitos («1.250» = 1250); «2.5» o «2,5» se rechazan como no enteros.
- [El `<dialog>` depende de JavaScript para abrirse desde el botón] → Navegadores actuales lo soportan (RP-13 Safari incluido); sin JavaScript el formulario sigue visible como respaldo dentro del `<dialog>` abierto por el servidor en caso de error.
- [La migración altera datos guardados] → Solo redondea costos; es idempotente y se registra en `schema_migrations`.

## Migration Plan

1. `npm run dev` (o cualquier arranque) aplica `002_hu06_ajuste_costo_clp.sql` sobre `data/app.db` automáticamente.
2. `npm run db:seed` no sobrescribe insumos existentes; los costos de ejemplo enteros solo afectan a bases nuevas.
3. Para volver atrás basta con borrar `data/` y cargar de nuevo los datos de ejemplo.
