-- Evaluación 2 · cambio de requerimientos (HU-01 CA7, HU-08, RP-15; EST-03; 08-modelo-dominio.md).
-- Venta.estado: «Confirmada», «Pendiente de confirmación» o «Cancelada» (estados de EST-03).
-- Las ventas registradas antes del cambio ya habían descontado sus insumos: quedan «Confirmada».
ALTER TABLE ventas ADD COLUMN estado TEXT NOT NULL DEFAULT 'Confirmada'
  CHECK (estado IN ('Confirmada', 'Pendiente de confirmación', 'Cancelada'));

-- Descuento * – 1 Venta («se origina en»): el Descuento de una venta que se confirma después apunta a esa venta.
-- pedido_id se mantiene (el pedido sigue alcanzable directamente, RP-08).
ALTER TABLE movimientos_inventario ADD COLUMN venta_id INTEGER REFERENCES ventas (id);

-- Descuentos anteriores: se asocian a la venta de su pedido cuyo producto lleva ese insumo en la receta.
UPDATE movimientos_inventario
SET venta_id = (
  SELECT v.id
  FROM ventas v
  JOIN recetas r ON r.producto_id = v.producto_id
  JOIN ingredientes i ON i.receta_id = r.id
  WHERE v.pedido_id = movimientos_inventario.pedido_id AND i.insumo_id = movimientos_inventario.insumo_id
  ORDER BY v.id
  LIMIT 1
)
WHERE tipo = 'Descuento' AND pedido_id IS NOT NULL;
