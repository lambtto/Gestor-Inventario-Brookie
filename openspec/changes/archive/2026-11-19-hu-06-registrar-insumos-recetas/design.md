# Diseño: HU-06 — Registrar insumos y recetas

## Context

Es la primera historia: no hay código. El stack confirmado es TypeScript estricto + Express + EJS + SQLite (`better-sqlite3`) + Vitest/supertest, con Node 24 instalado en el equipo. La fuente de verdad son los artefactos del curso y la ficha `.cin324/historias/HU-06.md`. Motivación y alcance: ver `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Esqueleto mínimo de la aplicación que las historias siguientes reutilizan (conexión, migraciones, seed, layout con selector de rol).
- Tablas derivadas del modelo de dominio solo para las clases que HU-06 usa o consulta.
- Una sola función de transición para el ciclo de vida de Insumo/AlertaDeStock (EST-01, EST-02).
- Una prueba automática por escenario Gherkin.

**Non-Goals:**
- Pantallas de stock, alertas, ingresos, ventas o informe (otras historias).
- Edición o reactivación de insumos; creación de productos.
- Requisitos no funcionales, autenticación real, frameworks de frontend.

## Decisions

### 1. Estructura del proyecto (en la raíz del repositorio)

```text
package.json, tsconfig.json, vitest.config.ts, README.md (sección de la app)
src/
  app.ts            crearApp(db) → Express (sin escuchar puerto; usado por las pruebas)
  server.ts         abre data/app.db, aplica migraciones, escucha en el puerto 3000
  db/
    conexion.ts     abrirBase(ruta | ":memory:"), aplicarMigraciones(db)
    migrations/001_hu06_insumos_recetas.sql
    seed.ts         datos de ejemplo idempotentes (npm run db:seed)
  dominio/
    insumo.ts       tipos, repositorio y transiciones (EST-01 / EST-02)   // HU-06, N05
    receta.ts       tipos, repositorio y validación de recetas            // HU-06, N05
  servicios/
    insumos.ts      registrarInsumo, eliminarInsumo, desactivarInsumo     // CU-06, CU-08
    recetas.ts      guardarReceta, obtenerReceta, listarProductos         // CU-07
  rutas/
    rol.ts, insumos.ts, recetas.ts
  vistas/           layout.ejs (selector de rol), insumos.ejs, recetas.ejs, receta.ejs, acceso-denegado.ejs
tests/              hu06-insumos.test.ts, hu06-recetas.test.ts, hu06-acceso.test.ts
data/               app.db (ignorado por git)
```

Se eligió poner la app en la raíz (junto a los documentos) para que `npm` funcione desde la carpeta del proyecto sin pasos extra. Alternativa descartada: subcarpeta `app/`, que obliga a `cd` antes de cada comando.

### 2. Tablas (migración 001), derivadas del modelo de dominio

| Tabla | Columnas | Origen |
|-------|----------|--------|
| `insumos` | id, nombre (UNIQUE, COLLATE NOCASE), unidad_medida TEXT NOT NULL, costo_unitario REAL NOT NULL ≥ 0, stock_actual REAL NOT NULL DEFAULT 0, stock_minimo REAL NOT NULL ≥ 0, activo INTEGER NOT NULL DEFAULT 1 | Insumo |
| `productos` | id, nombre UNIQUE | Producto |
| `recetas` | id, producto_id UNIQUE NOT NULL → productos, rendimiento INTEGER > 0 | Receta (Producto 1 – 0..1 Receta → UNIQUE) |
| `ingredientes` | id, receta_id → recetas ON DELETE CASCADE, insumo_id → insumos (RESTRICT), cantidad REAL > 0, UNIQUE(receta_id, insumo_id) | Ingrediente (composición con Receta) |
| `alertas_stock` | id, insumo_id → insumos ON DELETE CASCADE, fecha_generacion TEXT, estado CHECK IN ('Vigente','Resuelta') | AlertaDeStock |
| `pedidos` | id, numero, fecha_hora, monto_total | Pedido (solo para que un Descuento tenga su pedido; se usa de verdad en HU-01) |
| `movimientos_inventario` | id, tipo CHECK IN ('Descuento','Reposición'), insumo_id → insumos (RESTRICT), fecha, cantidad, pedido_id NULL → pedidos, responsable NULL | MovimientoDeInventario + herencia en una tabla con columna `tipo` |

`PRAGMA foreign_keys = ON` al abrir la base. Las migraciones se registran en `schema_migrations(nombre, aplicada_en)` y se aplican en orden al arrancar.

### 3. Ciclo de vida: una función de transición

El estado del insumo no se guarda: se deriva (`activo = 0` → Desactivado; `stock_actual ≤ stock_minimo` → Stock crítico; si no, Stock suficiente). Esto evita que el estado se desincronice del stock cuando HU-01 y HU-05 lo cambien.

`aplicarEventoInsumo(db, insumoId, evento)` en `dominio/insumo.ts` implementa las filas de EST-01/EST-02 que toca HU-06:
- `registrar` → crea el insumo con stock 0 y la alerta Vigente (acción «generar alerta»).
- `desactivar` → guarda `activo = 0`; si hay alerta Vigente la pasa a Resuelta («resolver alerta»). Desde Desactivado: error «El insumo ya está desactivado».
- `eliminar` → guarda: no está en ninguna receta y no tiene movimientos. Si se cumple, borra el insumo (sus alertas se borran por cascada: «eliminar alerta»). Si no, lanza `EliminacionRechazada`.

Cada evento corre dentro de una transacción. Los eventos de HU-01/HU-05 se agregarán a esta misma función en sus historias.

### 4. Rutas (desde DSS-04, DSS-05 y CU-07)

| Mensaje del diagrama | Ruta | Respuesta visible |
|----------------------|------|-------------------|
| — | `GET /` | redirige a `/insumos` |
| Seleccionar rol | `POST /rol` (cookie `rol`) | vuelve a la página anterior |
| (lista) | `GET /insumos` | tabla de insumos + formulario de registro |
| Registrar insumo (nombre, unidad, costo, mínimo) | `POST /insumos` | «Insumo registrado» / «Registro rechazado (…)» (HTTP 400) |
| Eliminar insumo (insumo) | `POST /insumos/:id/eliminar` | «Insumo eliminado» / «Eliminación rechazada (solo se puede desactivar)» con botón Desactivar (HTTP 409) |
| Desactivar insumo (insumo) | `POST /insumos/:id/desactivar` | «Insumo desactivado» |
| (lista de productos) | `GET /recetas` | productos con «Con receta» / «Sin receta» |
| (ver receta) | `GET /recetas/:productoId` | formulario de la receta |
| Definir receta | `POST /recetas/:productoId` | «Receta guardada» / «Receta rechazada (…)» (HTTP 400) |

Los mensajes se muestran en la misma página tras redirigir (patrón POST → redirect → GET con el mensaje en query) o re-renderizando con código 4xx en los rechazos, para que las pruebas puedan verificar el código y el texto.

### 5. Formulario de receta sin JavaScript de frontend

La pantalla de receta muestra un campo «Rendimiento», las líneas existentes y 3 líneas vacías (select de insumo + cantidad). Las líneas vacías se ignoran; un botón «Agregar más líneas» recarga la página con 3 líneas vacías más. El select ofrece solo insumos activos, más el insumo desactivado ya presente en esa línea (decisión C). Guardar reemplaza todas las líneas de la receta en una transacción; los Descuentos no se tocan porque guardan su propia cantidad.

### 6. Selector de rol

Middleware que lee la cookie `rol` (por defecto «Administrador») y la expone a las vistas. `soloAdministrador` protege `/insumos*` y `/recetas*` y responde 403 con «Acceso solo para el administrador». No hay usuarios ni contraseñas (S5).

### 7. Datos de ejemplo (seed idempotente: no duplica si ya existen)

- 13 productos: Lemon Empire, Biscoff Central, SoHo, M&M, Oreo, Nut York, Liberty Kiss, Velvet Avenue, Pistacho Queens, Café Latte, Cold Brew Brookie's, Banana Cloud, Capuchino.
- Insumos (unidad del cuaderno): mantequilla g, azúcar rubia g, azúcar blanca g, huevo más yema g, harina con polvos g, maicena g, sal g, vainilla cucharadita, chocolate chip g, chocolate blanco g, cacao g, colorante rojo en gel g, pistacho g, espresso doble «espresso doble», leche ml, café molido grueso g, agua fría g, cacao Pacari g, canela g. Costo y mínimo: valores de demostración (SH3). Cada insumo nace con su alerta Vigente.
- Recetas de masa (rendimiento 10), base común: mantequilla 250, azúcar rubia 120, azúcar blanca 80, huevo más yema 80, harina con polvos 400, maicena 20, sal 2, vainilla 1. Lemon Empire y Biscoff Central: base. SoHo, M&M, Oreo, Nut York: base + chocolate chip 100. Liberty Kiss: base + chocolate blanco 100. Velvet Avenue: base + chocolate blanco 100 + cacao 20 + colorante rojo en gel 3. Pistacho Queens: base + pistacho 50 + chocolate blanco 50.
- Bebidas (rendimiento 1): Café Latte = espresso doble 1 + leche 250. Cold Brew Brookie's = café molido grueso 100 + agua fría 1000. Capuchino = espresso doble 1 + leche 150 + cacao Pacari 20. Banana Cloud: sin receta (SH1).
- Canela: una Reposición de 500 g (responsable «Administrador»), stock 500; si su mínimo de demostración es menor que 500 su alerta queda Resuelta.

### 8. Pruebas

Cada archivo crea la app con una base `:memory:` nueva por prueba y prepara solo los datos del `Dado` (no usa el seed, para respetar «azúcar rubia no está registrado», SH4). Nombres: `HU-06 · <escenario>`. El Descuento del escenario de cambio de receta se inserta directamente en `movimientos_inventario` con un pedido de prueba.

## Risks / Trade-offs

- [`better-sqlite3` necesita binario nativo y el equipo tiene Node 24] → usar la versión 12.x, que publica binarios para Node 24; si la instalación falla, cambiar a `node:sqlite` (incluido en Node 24) detrás de la misma `conexion.ts`.
- [Costos y mínimos de ejemplo no vienen del cliente] → se marcan como demostración en el seed y en el README (SH3).
- [Estado derivado en vez de columna `estado`] → la regla del curso pide una columna; se prefiere derivarlo porque el stock lo cambiarán otras historias y una columna duplicada podría quedar inconsistente. La lógica sigue concentrada en una sola función de transición.
- [Formulario de receta con líneas fijas] → menos cómodo que agregar filas con JavaScript, pero sin dependencias de frontend.
