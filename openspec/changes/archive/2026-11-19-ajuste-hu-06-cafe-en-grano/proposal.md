# Proposal

## Why

En la segunda ronda de validación de la HU-06 (2026-11-19, OBS-1) el estudiante observó que «espresso doble» aparece como insumo, cuando en realidad es una preparación. Se agregó a `05-elicitacion.md` la aclaración: un espresso doble se prepara con **16 g de café en grano**, un insumo distinto del café molido grueso del Cold Brew (commit `b4de5f1`). Los datos de ejemplo (requisito de proyecto RY-05, migración de las recetas del cuaderno) deben reflejarlo.

Origen: **HU-06 Registrar insumos y recetas** (ficha `.cin324/historias/HU-06.md`, decisiones M, N y O), actividad del TO-BE **N05 — Registrar insumos y recetas**, caso de uso **CU-07 Definir receta de un producto**.

## What Changes

- Nuevo insumo de ejemplo **«café en grano»** (g, costo de demostración $25, stock mínimo de demostración 500 g), que nace con stock 0 y alerta vigente como cualquier insumo registrado (EST-01, EST-02).
- Recetas de ejemplo: **Café Latte** = 16 g de café en grano + 250 ml de leche; **Capuchino** = 16 g de café en grano + 150 ml de leche + 20 g de cacao Pacari.
- Se quita «espresso doble» de los insumos de ejemplo.
- En una base existente, una migración reemplaza en cualquier receta cada «n espresso doble» por «16·n g de café en grano» y elimina el insumo «espresso doble» con su alerta; si tuviera movimientos de inventario, solo se desactiva (guarda de «Eliminar insumo» en EST-01).

**Fuera del alcance:** cualquier cambio de comportamiento de las pantallas o reglas (las especificaciones `gestion-insumos`, `recetas-productos` y `acceso-por-rol` no cambian); la receta de Banana Cloud (sigue sin receta, supuesto SH1); otras historias (HU-01 a HU-05, HU-07).

## Capabilities

### New Capabilities
<!-- Ninguna. -->

### Modified Capabilities
<!-- Ninguna: solo cambian los datos de ejemplo, no el comportamiento del sistema. El cambio declara skip_specs: true. -->

## Impact

- Datos de ejemplo `src/db/seed.ts` (insumos y recetas).
- Migración nueva `src/db/migrations/003_hu06_cafe_en_grano.sql` para bases existentes (por ejemplo, `data/app.db`); en una base vacía no hace nada.
- Pruebas: `tests/hu06-seed.test.ts` (recetas del cuaderno) y `tests/hu06-base.test.ts` (migración).
- README: descripción de los datos de ejemplo.
