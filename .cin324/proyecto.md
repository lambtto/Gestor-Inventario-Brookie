# Estado del proyecto — generación de la aplicación

## Proyecto
- Nombre: Gestor de inventario de Brookies Coffee
- Repositorio de documentación: raíz del repositorio `Gestor-Inventario-Brookie`
- Última auditoría: 2026-11-05 — resultado: completo (con supuestos menores)

## Mapa de artefactos (rutas detectadas)
| Artefacto | Ruta(s) | Estado |
|-----------|---------|--------|
| BPMN AS-IS | `01-proceso-as-is.md`, `diagramas/as-is.bpmn`, `diagramas/as-is.png` | completo |
| BPMN TO-BE | `02-rediseno-to-be.md` (actividades N01–N05), `diagramas/to-be.bpmn`, `diagramas/to-be.png` | completo |
| Historias de usuario | `04-historias-usuario.md` (HU-01 a HU-06) | completo |
| Criterios Gherkin | `07-criterios-aceptacion.md` | completo |
| Modelo de dominio | `08-modelo-dominio.md`, `diagramas/modelo-dominio.puml` | completo |
| Casos de uso | `09-casos-de-uso.md`, `diagramas/casos-de-uso.puml` (CU-01 a CU-08) | completo |
| Diagramas de estado | `11-diagramas-estado.md`, `diagramas/est-01.puml` (Insumo), `diagramas/est-02.puml` (AlertaDeStock) | completo |
| Diagramas de secuencia | `10-diagramas-secuencia.md`, `diagramas/dss-01.puml` … `dss-05.puml` | completo |
| Requisitos y atributos de calidad | `03-requisitos.md`, `06-atributos-calidad.md` | completo |
| Datos de ejemplo (recetas) | `05-elicitacion.md` (Técnica 2: 8 recetas) | — |

## Supuestos acordados (por elementos faltantes o dudosos)
Confirmados por el estudiante el 2026-11-05:
- S1. Los productos (las 8 recetas de `05-elicitacion.md`) se cargan como datos de ejemplo; no hay pantalla para crear productos en esta versión.
- S2. Un producto sin receta sí registra su Venta; solo se omite el Descuento de insumos y se avisa al administrador.
- S3. El monto de cada Venta viene en el pedido que envía el sistema de toma de pedidos (Producto no tiene precio).
- S4. El sistema de toma de pedidos se simula con una pantalla «Simulador de pedidos» que envía un pedido confirmado.
- S5. RP-09 / HU-03 CA4: selector de rol de demostración (Administrador / Barista / Caja), sin login real.
- S7 (2026-11-05). El sistema externo de pedidos es la página web de la cafetería hecha en otro curso. Los pedidos del local los registra la cajera directamente en esa página (celular/tablet); el dueño solo descarta un kiosco de autoatención. Todo pedido llega al gestor como «Pedido confirmado».
- S8 (2026-11-05). Las cantidades de las recetas se registran con las unidades tal como están en el cuaderno del dueño (`05-elicitacion.md`): g, ml, cucharadita, espresso doble, pizca, etc. Cada una es la unidad de medida de su insumo. No se convierten ni se inventan equivalencias.
- S6. ~~No se implementa edición ni reactivación de insumos~~ — reemplazado el 2026-11-19: la edición y la reactivación quedaron especificadas en HU-06 (CA5, CA6; CU-09, CU-10). El costo usado en el informe de HU-04 se revisa al llegar a esa historia.

## Revisión de coherencia (2026-11-05)
- Correcciones 1–6, 9, 10 y 12 aplicadas en los `.md` con aprobación del estudiante (02, 03, 04, 05, 07, 08, 10, 11, 12).
- Aplicado también (aprobado): `est-01.puml`, `est-02.puml` (Eliminar insumo → eliminar alerta → final), `dss-02.puml`, `dss-05.puml`, `modelo-dominio.puml` (Venta.sinReceta), escenario Gherkin de producto sin receta; PNG regenerados con PlantUML 1.2024.7 (motor Smetana para clases y estados).
- Nombre del sistema externo: se mantiene «Sistema de toma de pedidos» (opción b). Aplicado en `02` (fila A01 → N06 «Registrar la comanda en la página web», A01 fuera de «No cambian», tareas de usuario) y `09` (descripción del actor).
- `to-be.bpmn` editado por Claude con aprobación (puntos 1, 7, 8 + A01 como tarea de usuario, inicio «Cliente pide en el local», flujos de mensaje «Comanda» y «Pedido confirmado» con el pool externo) y `to-be.png` regenerado con bpmn-js 17.11.1.
- Unidades de recetas: resuelto con el supuesto S8 (como dice el cuaderno).
- Re-auditoría 2026-11-05: los 10 artefactos están completos; se corrigió la variante de DSS-02 en `10-diagramas-secuencia.md` («insumo activo»).

## Stack (se define una sola vez)
- Definido el 2026-11-18 (opción A, confirmada por el estudiante): TypeScript estricto + Express + EJS + SQLite (better-sqlite3, archivo data/app.db) + Vitest + supertest; tsx en desarrollo.
- Migraciones SQL numeradas en src/db/migrations (tabla schema_migrations); datos de ejemplo en src/db/seed.ts.
- Comandos: npm install · npm run db:seed · npm run dev (http://localhost:3000) · npm test

## Historias
| Historia | Estado | Cambio de OpenSpec | Fecha | Observaciones |
|----------|--------|--------------------|-------|----------------|
| HU-01 Registrar venta | pendiente | — | — | Depende de insumos/recetas (HU-06 o datos de ejemplo) |
| HU-02 Alertar stock crítico | pendiente | — | — | |
| HU-03 Consultar stock | pendiente | — | — | |
| HU-04 Consultar informe | pendiente | — | — | |
| HU-05 Registrar ingreso de stock | pendiente | — | — | |
| HU-06 Registrar insumos y recetas | hecha | hu-06-registrar-insumos-recetas + ajuste-hu-06-editar-reactivar-validaciones + ajuste-hu-06-cafe-en-grano (los tres archivados 2026-11-19) | 2026-11-19 | 60 pruebas OK, typecheck OK. Migraciones 001–003. Editar/reactivar, costo CLP entero, ventana emergente `<dialog>`, café en grano en vez de espresso doble. Comandos: npm install · npm run db:seed · npm run dev · npm test |
| HU-07 Ajustar stock | pendiente | — | — | Nueva (validación HU-06, 2026-11-19): merma y corrección de conteo |

## Validaciones
| Historia | Informe | Estado | Fecha |
|----------|---------|--------|-------|
| HU-06 (ronda 1) | (no guardado; resumen en la ficha, «Origen del ajuste») | artefactos actualizados (f73f1e2) y regenerado (ajuste-hu-06-editar-reactivar-validaciones) | 2026-11-19 |
| HU-06 (ronda 2) | (no guardado; decisiones M–O en la ficha) | aclaración en 05 (b4de5f1) y regenerado (ajuste-hu-06-cafe-en-grano); cerrado por el estudiante | 2026-11-19 |

## Cambios posteriores
| Cambio | Historia afectada | Motivo | Fecha |
|--------|-------------------|--------|-------|
| ajuste-hu-06-editar-reactivar-validaciones | HU-06 | OBS-1 a OBS-5: editar y reactivar insumos, nombre con letra, costo CLP entero, ventana emergente | 2026-11-19 (archivado) |
| ajuste-hu-06-cafe-en-grano | HU-06 | Validación ronda 2, OBS-1: espresso doble = 16 g de café en grano (datos de ejemplo + migración 003; sin specs delta) | 2026-11-19 (archivado; 5/5 tareas, 60 pruebas OK) |
