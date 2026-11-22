# Tareas: HU-05 — Registrar ingreso de stock

## 1. Dominio (EST-01 / EST-02)

- [x] 1.1 Agregar el evento `registrarIngreso` a `aplicarEventoInsumo` (Reposición, stock resultante, resolver la alerta si queda sobre el mínimo, rechazar si el insumo está desactivado); verificar con las pruebas «HU-05 · El ingreso levanta una alerta vigente», «HU-05 · El ingreso no alcanza a superar el mínimo» e «HU-05 · Insumo desactivado»

## 2. Servicio de ingresos (ingreso-stock)

- [x] 2.1 Implementar `src/servicios/ingresos.ts` (`registrarIngreso`, `listarReposiciones`) con la validación y los mensajes de la especificación; verificar con las pruebas «HU-05 · Ingreso de un insumo comprado», «HU-05 · Ingreso sin indicar la cantidad recibida» y «HU-05 · Cantidad no válida»

## 3. Pantalla

- [x] 3.1 Implementar `src/rutas/ingresos.ts` y `src/vistas/ingresos.ejs`, `soloAdministrador` para `/ingresos` en `app.ts` y el enlace en `cabecera.ejs`; verificar con las pruebas «HU-05 · Ver la reposición en la lista» y «HU-05 · Otro rol intenta registrar un ingreso»

## 4. Integración y documentación

- [x] 4.1 Ejecutar `npm test` y `npm run typecheck` completos (pruebas nuevas y de regresión de HU-01, HU-06 y HU-07)
- [x] 4.2 Actualizar `README.md` con la pantalla «Registrar ingreso» y el recorrido de demostración; verificar ejecutando los comandos tal como están escritos
