# Propuesta: HU-06 — Registrar insumos y recetas

## Why

Hoy las recetas de Brookies Coffee están solo en el cuaderno del dueño y los insumos no se registran en ningún sistema, así que no es posible calcular qué insumos consume cada venta. HU-06 implementa la actividad nueva del TO-BE **N05 — Registrar insumos y recetas** (tarea de usuario), que es la base de datos maestra de la que dependen todas las demás historias (HU-01 descuenta según la receta; HU-02, HU-03 y HU-05 trabajan sobre el stock de los insumos; HU-04 usa su costo). Por eso es la primera historia que se construye.

Origen: historia HU-06 (`04-historias-usuario.md`), Gherkin en `07-criterios-aceptacion.md`, casos de uso **CU-06 Registrar insumo**, **CU-07 Definir receta de un producto** y **CU-08 Dar de baja un insumo** (actor: Administrador), diagramas DSS-04, DSS-05, EST-01 y EST-02. Ficha confirmada: `.cin324/historias/HU-06.md`.

## What Changes

- Se crea la aplicación web (primera historia): servidor, base SQLite con migraciones, datos de ejemplo y selector de rol de demostración (Administrador, Barista, Caja), según RP-09 y el supuesto S5.
- **CU-06:** el administrador registra un insumo con nombre, unidad de medida, costo unitario y stock mínimo. El insumo nace con stock 0, en estado «Stock crítico» y con una AlertaDeStock «Vigente» (EST-01, EST-02). Si falta un dato, el registro se rechaza.
- **CU-07:** el administrador define o modifica la receta de un producto: rendimiento y una o más líneas (Ingrediente = insumo activo + cantidad). Modificar una receta no altera los Descuentos ya registrados.
- **CU-08:** el administrador elimina un insumo solo si no forma parte de ninguna receta ni tiene movimientos de inventario (y entonces se eliminan sus alertas); si no, solo puede desactivarlo. Desactivar resuelve la alerta vigente.
- Pantalla «Insumos» (lista con nombre, unidad, costo, mínimo y Activo/Desactivado) y pantalla de recetas por producto.
- Datos de ejemplo: 13 productos del cuaderno (S1), sus insumos y recetas con las unidades del cuaderno (S8), Banana Cloud sin receta (SH1), insumo «canela» con una Reposición de 500 g, costos y mínimos de demostración (SH3).

## Capabilities

### New Capabilities
- `gestion-insumos`: registro de insumos, su ciclo de vida (Stock crítico / Stock suficiente / Desactivado), la alerta inicial de stock crítico y la baja (eliminar o desactivar) de insumos.
- `recetas-productos`: definición y modificación de la receta de cada producto (rendimiento e ingredientes con su cantidad).
- `acceso-por-rol`: selección de rol de demostración y restricción del módulo de inventario al Administrador.

### Modified Capabilities
- (ninguna; es el primer cambio del proyecto)

## Impact

- Código nuevo: proyecto TypeScript (Express + EJS + better-sqlite3 + Vitest), migraciones SQL, script de datos de ejemplo, pantallas y pruebas (una por escenario Gherkin).
- Tablas creadas según el modelo de dominio: insumos, productos, recetas, ingredientes, alertas_stock, pedidos y movimientos_inventario (estas dos últimas solo para que exista la historia de un insumo; se llenan en HU-01 y HU-05).
- Sin sistemas externos en esta historia.

## Fuera de alcance

- Editar o reactivar insumos (supuesto S6) y crear productos (S1).
- Consultar stock y alertas (HU-03, HU-02), registrar ingresos (HU-05), descontar insumos por pedido (HU-01), informe (HU-04).
- Requisitos no funcionales (RP-10 a RP-13) y autenticación real.
