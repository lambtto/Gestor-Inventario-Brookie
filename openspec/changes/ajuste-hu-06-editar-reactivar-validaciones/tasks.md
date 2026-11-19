# Tasks

## 1. Datos (costo en CLP)

- [x] 1.1 Crear `src/db/migrations/002_hu06_ajuste_costo_clp.sql` que redondea `costo_unitario` al entero y verificar con una prueba que una base con costo 1,5 queda en 2 tras abrirla
- [x] 1.2 Cambiar en `src/db/seed.ts` los costos de ejemplo a enteros (azúcar blanca 2, harina con polvos 1, sal 1, leche 1, agua fría 0) y verificar en `tests/hu06-seed.test.ts` que todos los costos de ejemplo son enteros

## 2. Dominio (EST-01 / EST-02)

- [x] 2.1 Agregar el evento `editar` a `aplicarEventoInsumo` (actualiza los cuatro datos y, si el insumo está activo, genera o resuelve la alerta según el nuevo mínimo) y verificar con las pruebas «Subir el stock mínimo sobre el stock actual», «Bajar el stock mínimo bajo el stock actual» y «Editar un insumo desactivado»
- [x] 2.2 Agregar el evento `reactivar` (exige insumo desactivado; activa y genera alerta si stock ≤ mínimo) y verificar con «Reactivar un insumo desactivado con stock crítico» y «Reactivar un insumo con stock suficiente»

## 3. Servicio (reglas y mensajes)

- [x] 3.1 Ampliar `validarInsumo`: nombre con al menos una letra, costo entero ≥ 0 en CLP, mínimo ≥ 0, mensajes separados por causa y unicidad que excluye al propio insumo al editar; verificar con «Registrar un insumo con un nombre sin letras», «Registrar un insumo con costo en decimales», «Costo negativo», «Stock mínimo negativo» y «Nombre repetido»
- [x] 3.2 Agregar `editarInsumo` (prefijo «Edición rechazada») y `reactivarInsumo` con los mensajes «Insumo actualizado» e «Insumo reactivado»; verificar con «Editar el costo de un insumo» y «Editar con un nombre de otro insumo»

## 4. Pantalla «Insumos»

- [x] 4.1 Agregar las rutas `POST /insumos/:id/editar` y `POST /insumos/:id/reactivar` (con el control de rol existente) y verificar con supertest que responden 303 con el mensaje y que Barista recibe «Acceso solo para el administrador»
- [x] 4.2 Reemplazar el formulario fijo por un `<dialog>` centrado para registrar y editar (botón «Registrar insumo», botón «Editar» por fila con datos `data-*`, script que lo abre con `showModal()`), que se muestra abierto con el motivo y los datos cuando hay un rechazo; verificar con «El formulario de insumo se abre en una ventana emergente» y «La ventana se reabre con el motivo del rechazo»
- [x] 4.3 Mostrar el costo con formato CLP ($1.250) y la acción «Reactivar» en lugar de «Desactivar» para los insumos desactivados; verificar con «Ver la lista de insumos» y «Costo en formato CLP»
- [x] 4.4 Ajustar el escenario existente «Registrar un insumo nuevo» al texto con «$2 CLP» y correr `npm test` y `npm run typecheck` sin errores

## 5. Documentación

- [x] 5.1 Actualizar el `README.md` (sección Aplicación: historias implementadas, pantallas con Editar/Reactivar y ventana emergente, costos en CLP) y verificar que los comandos de instalación, ejecución y pruebas siguen siendo correctos

## Workflow follow-up

- Recorrer a mano los escenarios y validar el sistema con `/cin324-validar-sistema`.
- Archivar el cambio con `/opsx:archive` cuando la validación no tenga observaciones pendientes.
