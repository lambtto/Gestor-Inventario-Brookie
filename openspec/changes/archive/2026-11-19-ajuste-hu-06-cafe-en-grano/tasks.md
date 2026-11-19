# Tasks

## 1. Datos de ejemplo

- [x] 1.1 En `src/db/seed.ts`, reemplazar el insumo «espresso doble» por «café en grano» (g, $25, mínimo 500) y las recetas de Café Latte y Capuchino por 16 g de café en grano; verificar en `tests/hu06-seed.test.ts` que el Café Latte queda con 16 g de café en grano y 250 ml de leche, el Capuchino con 16 g de café en grano, 150 ml de leche y 20 g de cacao Pacari, y que no existe el insumo «espresso doble»

## 2. Base existente

- [x] 2.1 Crear `src/db/migrations/003_hu06_cafe_en_grano.sql` (crea café en grano con alerta vigente, convierte n espresso doble en 16·n g de café en grano en cualquier receta y elimina el espresso doble, o lo desactiva si tiene movimientos); verificar en `tests/hu06-base.test.ts` con una base que simula la anterior: recetas convertidas, espresso eliminado, café en grano con una alerta vigente, y que en una base sin espresso no hace nada
- [x] 2.2 Verificar en `tests/hu06-base.test.ts` el caso con movimientos: si «espresso doble» tiene una Reposición, queda desactivado y sin alerta vigente
- [x] 2.3 Correr `npm test` y `npm run typecheck` sin errores y comprobar en el servidor en marcha que la pantalla «Insumos» ya no muestra «espresso doble» y muestra «café en grano»

## 3. Documentación

- [x] 3.1 Actualizar en el `README.md` la descripción de los datos de ejemplo (café en grano en vez de espresso doble) y verificar que los comandos siguen siendo correctos

## Workflow follow-up

- Validar el sistema con `/cin324-validar-sistema`.
- Archivar el cambio con `/opsx:archive` cuando la validación no tenga observaciones pendientes.
