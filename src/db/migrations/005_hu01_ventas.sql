-- HU-01 (N01 Descontar insumos y registrar venta, CU-01, DSS-01). 08-modelo-dominio.md:
-- Venta (cantidad, monto, sinReceta); Pedido 1 ◆– 1..* Venta (composición); Venta * – 1 Producto.
-- La tabla pedidos ya existe desde la migración 001. El 1..* lo asegura el servicio (rechaza pedidos sin productos).
CREATE TABLE ventas (
  id          INTEGER PRIMARY KEY,
  pedido_id   INTEGER NOT NULL REFERENCES pedidos (id) ON DELETE CASCADE,
  producto_id INTEGER NOT NULL REFERENCES productos (id),
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  monto       INTEGER NOT NULL CHECK (monto >= 0),
  sin_receta  INTEGER NOT NULL DEFAULT 0 CHECK (sin_receta IN (0, 1))
);
