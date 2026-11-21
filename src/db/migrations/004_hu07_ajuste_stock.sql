-- HU-07 (N07 Ajustar stock, CU-11, DSS-06). 08-modelo-dominio.md: MovimientoDeInventario ← Descuento, Reposición, Ajuste.
-- SQLite no permite cambiar un CHECK: se reconstruye la tabla conservando las filas (y sus ids).
-- Ninguna tabla referencia a movimientos_inventario, así que se puede reemplazar con las claves foráneas activas.
CREATE TABLE movimientos_inventario_nueva (
  id          INTEGER PRIMARY KEY,
  tipo        TEXT    NOT NULL CHECK (tipo IN ('Descuento', 'Reposición', 'Ajuste')),
  insumo_id   INTEGER NOT NULL REFERENCES insumos (id) ON DELETE RESTRICT,
  fecha       TEXT    NOT NULL,
  cantidad    REAL    NOT NULL,
  pedido_id   INTEGER REFERENCES pedidos (id),
  responsable TEXT,
  -- Ajuste.motivo (RP-14): «Merma» o «Corrección de conteo»; solo los Ajustes llevan motivo.
  motivo      TEXT    CHECK (motivo IS NULL OR motivo IN ('Merma', 'Corrección de conteo')),
  CHECK ((tipo = 'Ajuste') = (motivo IS NOT NULL))
);

INSERT INTO movimientos_inventario_nueva (id, tipo, insumo_id, fecha, cantidad, pedido_id, responsable)
SELECT id, tipo, insumo_id, fecha, cantidad, pedido_id, responsable FROM movimientos_inventario;

DROP TABLE movimientos_inventario;
ALTER TABLE movimientos_inventario_nueva RENAME TO movimientos_inventario;
