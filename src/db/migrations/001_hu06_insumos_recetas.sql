-- HU-06 (N05 Registrar insumos y recetas). Tablas derivadas de 08-modelo-dominio.md

-- Insumo. El estado (Stock crítico / Stock suficiente / Desactivado, EST-01) se deriva de activo y stock.
CREATE TABLE insumos (
  id             INTEGER PRIMARY KEY,
  nombre         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  unidad_medida  TEXT    NOT NULL CHECK (length(trim(unidad_medida)) > 0),
  costo_unitario REAL    NOT NULL CHECK (costo_unitario >= 0),
  stock_actual   REAL    NOT NULL DEFAULT 0,
  stock_minimo   REAL    NOT NULL CHECK (stock_minimo >= 0),
  activo         INTEGER NOT NULL DEFAULT 1 CHECK (activo IN (0, 1))
);

-- Producto (datos de ejemplo, supuesto S1)
CREATE TABLE productos (
  id     INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

-- Receta: Producto 1 – 0..1 Receta
CREATE TABLE recetas (
  id          INTEGER PRIMARY KEY,
  producto_id INTEGER NOT NULL UNIQUE REFERENCES productos (id),
  rendimiento INTEGER NOT NULL CHECK (rendimiento > 0)
);

-- Ingrediente: composición con Receta (1..*), usa 1 Insumo
CREATE TABLE ingredientes (
  id        INTEGER PRIMARY KEY,
  receta_id INTEGER NOT NULL REFERENCES recetas (id) ON DELETE CASCADE,
  insumo_id INTEGER NOT NULL REFERENCES insumos (id) ON DELETE RESTRICT,
  cantidad  REAL    NOT NULL CHECK (cantidad > 0),
  UNIQUE (receta_id, insumo_id)
);

-- AlertaDeStock (EST-02). Se elimina junto con su insumo.
CREATE TABLE alertas_stock (
  id               INTEGER PRIMARY KEY,
  insumo_id        INTEGER NOT NULL REFERENCES insumos (id) ON DELETE CASCADE,
  fecha_generacion TEXT    NOT NULL,
  estado           TEXT    NOT NULL DEFAULT 'Vigente' CHECK (estado IN ('Vigente', 'Resuelta'))
);

-- Pedido: solo para que un Descuento tenga su pedido (se usa en HU-01)
CREATE TABLE pedidos (
  id           INTEGER PRIMARY KEY,
  numero       INTEGER NOT NULL UNIQUE,
  fecha_hora   TEXT    NOT NULL,
  monto_total  REAL    NOT NULL
);

-- MovimientoDeInventario con herencia en una tabla (tipo = Descuento | Reposición)
CREATE TABLE movimientos_inventario (
  id          INTEGER PRIMARY KEY,
  tipo        TEXT    NOT NULL CHECK (tipo IN ('Descuento', 'Reposición')),
  insumo_id   INTEGER NOT NULL REFERENCES insumos (id) ON DELETE RESTRICT,
  fecha       TEXT    NOT NULL,
  cantidad    REAL    NOT NULL,
  pedido_id   INTEGER REFERENCES pedidos (id),
  responsable TEXT
);
