# Design

## Context

Los datos de ejemplo se cargan con `cargarDatosDeEjemplo` (`src/db/seed.ts`), que es idempotente: no duplica ni sobrescribe insumos o recetas existentes. Por eso cambiar solo `seed.ts` no corrige una base ya creada (como `data/app.db`, donde «espresso doble» está en las recetas de Café Latte y Capuchino). Las migraciones SQL numeradas (`src/db/migrations`) se aplican una sola vez por base al abrirla, incluidas las bases en memoria de las pruebas.

## Goals / Non-Goals

**Goals:**
- Bases nuevas: los datos de ejemplo ya traen «café en grano» y las recetas con 16 g.
- Bases existentes: quedan iguales a una base nueva en lo que respecta al espresso, sin perder recetas que el administrador haya definido.

**Non-Goals:**
- Una regla general de «preparaciones» o sub-recetas: el modelo de dominio no la tiene (Receta → Ingrediente → Insumo).
- Cambiar costos, mínimos o recetas que el administrador ya editó, salvo las líneas de espresso doble.

## Decisions

1. **Seed:** se reemplaza `['espresso doble', 'espresso doble', 400, 20]` por `['café en grano', 'g', 25, 500]` y las líneas `['espresso doble', 1]` por `['café en grano', 16]`.

2. **Migración `003_hu06_cafe_en_grano.sql`**, en SQL y condicionada a que exista el insumo «espresso doble» (en una base vacía o nueva no hace nada):
   - Crea «café en grano» (g, $25, mínimo 500, stock 0, activo) si no existe, con su alerta «Vigente», igual que la transición inicial «Registrar insumo» de EST-01 / EST-02.
   - En cada receta, convierte la línea «n espresso doble» en «16·n g de café en grano». Si la receta ya tenía café en grano (la tabla no admite dos líneas del mismo insumo en una receta), suma la cantidad a esa línea y borra la de espresso.
   - Si «espresso doble» no tiene movimientos, lo elimina (sus alertas se eliminan en cascada); si los tuviera, lo desactiva y resuelve su alerta vigente (EST-01 / EST-02).
   - Alternativa descartada: hacerlo en `seed.ts` con código TypeScript; el seed no corre al arrancar el servidor y no debe sobrescribir datos del administrador.

3. **Equivalencia fija de 16 g** solo para esta conversión de datos, porque es un dato confirmado en `05-elicitacion.md`; no se agrega ninguna conversión general de unidades (supuesto S8).

## Risks / Trade-offs

- [El administrador pudo haber editado «espresso doble» (otro nombre o unidad)] → La migración solo busca el nombre «espresso doble» (sin distinguir mayúsculas); si lo renombró, no se toca y se puede corregir a mano desde la pantalla.
- [La migración modifica recetas guardadas] → Solo cambia líneas de espresso doble; se registra en `schema_migrations` y no se vuelve a aplicar.

## Migration Plan

1. Al reiniciar el servidor (`npm run dev`), la migración 003 se aplica sola sobre `data/app.db`.
2. Para partir de cero: borrar `data/` y ejecutar `npm run db:seed`.
