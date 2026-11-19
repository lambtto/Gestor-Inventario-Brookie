# Tasks

## 1. Datos

- [x] 1.1 Crear `src/db/migrations/004_hu07_ajuste_stock.sql` (tipo «Ajuste» y columna `motivo` en `movimientos_inventario`, conservando las filas existentes); verificar con una prueba que la Reposición de la canela se conserva, que se puede insertar un Ajuste con motivo y que la base rechaza un Ajuste sin motivo

## 2. Dominio (EST-01 / EST-02)

- [x] 2.1 Agregar el evento `ajustar` a `aplicarEventoInsumo` (merma y corrección de conteo, stock no negativo, movimiento con signo, alerta según el stock resultante y sin alertas para un insumo desactivado); verificar con «Registrar una merma», «Corregir el conteo hacia arriba», «Corregir el conteo hacia abajo», «Corrección igual al stock actual», «Una merma deja el insumo en stock crítico», «Una corrección de conteo resuelve la alerta» y «Ajustar un insumo desactivado»

## 3. Servicio

- [x] 3.1 Crear `src/servicios/ajustes.ts` (lectura y validación del formulario, mensajes de rechazo, `listarAjustes`); verificar con «Una merma mayor que el stock se rechaza», «Merma de cero», «Cantidad contada negativa» y «Ajuste sin cantidad»

## 4. Pantalla «Ajustar stock»

- [x] 4.1 Crear `src/rutas/ajustes.ts` y `src/vistas/ajustes.ejs` (formulario con el stock en el selector, lista de ajustes, mensaje con el stock resultante) y registrar la ruta en `app.ts` con `soloAdministrador`; verificar con supertest «Ver el stock en el selector», «Ver el ajuste en la lista» y el mensaje «Ajuste registrado (stock actualizado: 1700 ml)»
- [x] 4.2 Agregar el enlace «Ajustar stock» en la cabecera y verificar con «Solo el administrador ajusta stock» (Barista recibe «Acceso solo para el administrador» en GET y POST)
- [x] 4.3 Correr `npm test` y `npm run typecheck` sin errores y comprobar en el servidor en marcha que la pantalla «Ajustar stock» registra una merma

## 5. Documentación

- [x] 5.1 Actualizar el `README.md` (HU-07 implementada, pantalla «Ajustar stock») y verificar que los comandos de instalación, ejecución y pruebas siguen siendo correctos

## Workflow follow-up

- Validar el sistema con `/cin324-validar-sistema`.
- Archivar el cambio con `/opsx:archive` cuando la validación no tenga observaciones pendientes.
