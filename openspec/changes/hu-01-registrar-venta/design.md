# Design

## Context

- La migración 001 ya creó `pedidos (id, numero UNIQUE, fecha_hora, monto_total)` «para que un Descuento tenga su pedido», y `movimientos_inventario` (reconstruida en la 004) ya admite `tipo = 'Descuento'` con `pedido_id`. Falta la clase **Venta** del modelo de dominio (cantidad, monto, sinReceta; composición Pedido 1 – 1..* Venta; Venta * – 1 Producto).
- `insumos.stock_actual` no tiene `CHECK >= 0`, así que admite el stock negativo de la decisión A sin cambiar el esquema.
- `src/dominio/insumo.ts` concentra todas las transiciones de EST-01 / EST-02 en `aplicarEventoInsumo` (cada evento en su propia transacción); el estado del Insumo se deriva de `activo` y de comparar `stock_actual` con `stock_minimo`. Ya existen `generarAlerta`, `tieneAlertaVigente` y `redondear` (3 decimales).
- `src/dominio/receta.ts` lee productos y recetas (`obtenerProductoPorNombre`, `obtenerReceta`).
- El rol de demostración está en `res.locals.rol`; `soloAdministrador` protege rutas en `app.ts`. Las pantallas siguen el patrón EJS + formulario POST + redirección 303 con `?ok=`; un rechazo vuelve a mostrar la pantalla con el motivo y código 400.
- Pruebas: `tests/ayuda.ts` crea una base en memoria por prueba (`nuevoEntorno`, `dadoInsumo`, `dadoProducto`, `dadaReceta`, `dadaReposicion`), sin datos de ejemplo (SH4).

## Goals / Non-Goals

**Goals:**
- Procesar un pedido confirmado completo (pedido, ventas, descuentos, alertas) en **una sola transacción**: o queda todo registrado o nada.
- Reutilizar la función única de transiciones para el descuento de cada insumo (evento `descontar`).
- Separar el simulador (sustituto del sistema externo) del procesamiento del pedido, para que el día de mañana la página web real llame al mismo servicio.

**Non-Goals:**
- Una API HTTP/JSON para el sistema externo real (el simulador llama al servicio dentro del mismo proceso).
- Tabla propia de avisos: el aviso de producto sin receta se deriva de las ventas con `sin_receta = 1`.
- Pantalla de alertas (HU-02); anular o editar pedidos; paginar o filtrar la lista de ventas.

## Decisions

1. **Migración `005_hu01_ventas.sql`:** tabla `ventas (id, pedido_id NOT NULL REFERENCES pedidos ON DELETE CASCADE, producto_id NOT NULL REFERENCES productos, cantidad INTEGER NOT NULL CHECK (cantidad > 0), monto INTEGER NOT NULL CHECK (monto >= 0), sin_receta INTEGER NOT NULL CHECK (sin_receta IN (0,1)))`. Se deriva de la clase Venta y de sus dos asociaciones. `pedidos` no cambia. Alternativa descartada: guardar las líneas como JSON en `pedidos`; perdería la asociación Venta – Producto que usará HU-04.

2. **Sistema externo simulado (S4/S7):** la integración se define como una función de servicio `procesarPedidoConfirmado(db, lineas)` que representa el mensaje «Pedido confirmado» de DSS-01 y devuelve el número del pedido («Pedido registrado»). La pantalla `/simulador` es la versión simulada del Sistema de toma de pedidos: arma las líneas y llama a esa función. Se avisa en la pantalla con una nota: «Simula la página web de pedidos de la cafetería».

3. **Procesamiento del pedido** (`src/dominio/pedido.ts`, dentro de `db.transaction`):
   - Valida: al menos una línea; cada línea con producto existente, cantidad entera > 0 y monto entero ≥ 0. Si no, `ErrorDeNegocio('Pedido rechazado (dato faltante o inválido)')` y no se escribe nada.
   - Inserta el Pedido: `numero = MAX(numero) + 1` (1 si no hay), `fecha_hora = ahora` (ISO), `monto_total = Σ montos`.
   - Por cada línea (loop de DSS-01): busca la receta. **alt con receta:** inserta la Venta con `sin_receta = 0` y, por cada ingrediente, llama a `aplicarEventoInsumo(db, { tipo: 'descontar', insumoId, cantidad: redondear(cantidadIngrediente × unidades ÷ rendimiento), pedidoId })`. **alt sin receta:** inserta la Venta con `sin_receta = 1` y no descuenta.
   - better-sqlite3 anida la transacción de cada evento como *savepoint* dentro de la del pedido, así que un error en cualquier punto deshace todo.

4. **Evento `descontar`** en `aplicarEventoInsumo` (`{ insumoId, cantidad, pedidoId }`):
   - `resultante = redondear(stock − cantidad)`, sin límite inferior (decisión A).
   - Registra `('Descuento', insumo, ahora, cantidad, pedido_id)`; la **cantidad del Descuento se guarda positiva** (el tipo indica que resta), igual que la Reposición, para que «Descuento de 50 g» se lea tal cual. El Ajuste sigue guardando su diferencia con signo.
   - Si el insumo está activo y el estado resultante es «Stock crítico» sin alerta vigente → `generarAlerta` (EST-01 Stock suficiente → Stock crítico; EST-02 (inicial) → Vigente). Si ya tenía alerta vigente, nada. Desactivado: solo stock y movimiento (CA6). Un descuento nunca resuelve alertas (solo resta).

5. **Pantalla «Simulador de pedidos»** (`src/rutas/simulador.ts`, `src/vistas/simulador.ejs`): `GET /simulador` muestra 5 filas fijas (producto en un selector con todos los productos, cantidad, monto); las filas con producto vacío se ignoran, así no hace falta JavaScript. `POST /simulador` llama al servicio y redirige con «Pedido N° X registrado»; ante un rechazo vuelve a mostrar el formulario con el mensaje y los datos escritos (400). Sin `soloAdministrador`: representa a la cajera (decisión E).

6. **Pantalla «Ventas»** (`src/rutas/ventas.ts`, `src/vistas/ventas.ejs`): `GET /ventas` lista los avisos («<producto> no tiene receta (pedido N° X)») y los pedidos del más reciente al más antiguo, cada uno con su tabla de ventas y de descuentos (insumo, cantidad y unidad, sin decimales sobrantes). Montos con `formatoCLP` existente ($7.000). Se agrega `/ventas` a `soloAdministrador` y ambos enlaces («Simulador de pedidos», «Ventas») a la cabecera.

## Risks / Trade-offs

- [Stock negativo visible en Insumos] → Es la decisión A: refleja que el inventario estaba desactualizado; se corrige con HU-07 (ajuste) o HU-05 (ingreso). Los datos de ejemplo tienen stock 0, así que el recorrido manual parte con un ajuste.
- [Número correlativo con `MAX + 1`] → Correcto dentro de la transacción en una base SQLite de un solo proceso; `UNIQUE` en `numero` evita duplicados.
- [Decimales en cantidades (2 Lemon Empire × 1 cucharadita ÷ 10 = 0,2)] → `redondear` a 3 decimales; se muestran sin ceros sobrantes.
- [Un producto repetido en dos líneas] → Se registran dos Ventas; es válido según el modelo (Venta * – 1 Producto).

## Migration Plan

1. Al reiniciar el servidor se aplica la migración 005 sobre `data/app.db`; no hay datos que convertir.
2. Para partir de cero: borrar `data/` y ejecutar `npm run db:seed`.
