-- HU-01 (N01 Descontar insumos y registrar venta). Clase Venta de 08-modelo-dominio.md.
-- Pedido 1 – 1..* Venta (composición); Venta * – 1 Producto. La tabla pedidos ya existe (migración 001).
CREATE TABLE ventas (
  id          INTEGER PRIMARY KEY,
  pedido_id   INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos (id),
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  monto       INTEGER NOT NULL CHECK (monto >= 0),
  sin_receta  INTEGER NOT NULL CHECK (sin_receta IN (0, 1))
);
