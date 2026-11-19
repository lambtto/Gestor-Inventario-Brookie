-- Ajuste HU-06 (cambio ajuste-hu-06-cafe-en-grano), decisiones M, N y O de la ficha HU-06.
-- Fuente: 05-elicitacion.md, aclaración posterior: un «espresso doble» es una preparación con 16 g de café en grano.
-- Solo actúa si existe el insumo «espresso doble» (bases creadas antes del ajuste); en una base vacía no hace nada.

-- 1. Crear «café en grano» (valores de demostración, SH3) si hace falta.
--    Igual que «Registrar insumo» (EST-01 / EST-02): nace activo, con stock 0 y una alerta Vigente.
INSERT INTO insumos (nombre, unidad_medida, costo_unitario, stock_actual, stock_minimo, activo)
SELECT 'café en grano', 'g', 25, 0, 500, 1
WHERE EXISTS (SELECT 1 FROM insumos WHERE nombre = 'espresso doble')
  AND NOT EXISTS (SELECT 1 FROM insumos WHERE nombre = 'café en grano');

INSERT INTO alertas_stock (insumo_id, fecha_generacion, estado)
SELECT c.id, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 'Vigente'
FROM insumos c
WHERE c.nombre = 'café en grano'
  AND EXISTS (SELECT 1 FROM insumos WHERE nombre = 'espresso doble')
  AND c.activo = 1 AND c.stock_actual <= c.stock_minimo
  AND NOT EXISTS (SELECT 1 FROM alertas_stock a WHERE a.insumo_id = c.id AND a.estado = 'Vigente');

-- 2. En recetas que ya tienen café en grano: sumar 16 g por cada espresso doble y quitar la línea de espresso.
UPDATE ingredientes
SET cantidad = cantidad + 16 * (
  SELECT e.cantidad FROM ingredientes e
  WHERE e.receta_id = ingredientes.receta_id
    AND e.insumo_id = (SELECT id FROM insumos WHERE nombre = 'espresso doble'))
WHERE insumo_id = (SELECT id FROM insumos WHERE nombre = 'café en grano')
  AND receta_id IN (
    SELECT receta_id FROM ingredientes
    WHERE insumo_id = (SELECT id FROM insumos WHERE nombre = 'espresso doble'));

DELETE FROM ingredientes
WHERE insumo_id = (SELECT id FROM insumos WHERE nombre = 'espresso doble')
  AND receta_id IN (
    SELECT receta_id FROM ingredientes
    WHERE insumo_id = (SELECT id FROM insumos WHERE nombre = 'café en grano'));

-- 3. En las demás recetas: «n espresso doble» pasa a «16·n g de café en grano».
UPDATE ingredientes
SET insumo_id = (SELECT id FROM insumos WHERE nombre = 'café en grano'),
    cantidad = cantidad * 16
WHERE insumo_id = (SELECT id FROM insumos WHERE nombre = 'espresso doble');

-- 4. Sacar «espresso doble» de los insumos (EST-01, guarda de «Eliminar insumo»):
--    con movimientos solo se desactiva y se resuelve su alerta vigente; sin movimientos se elimina (sus alertas en cascada).
UPDATE alertas_stock SET estado = 'Resuelta'
WHERE estado = 'Vigente'
  AND insumo_id IN (
    SELECT i.id FROM insumos i
    WHERE i.nombre = 'espresso doble'
      AND EXISTS (SELECT 1 FROM movimientos_inventario m WHERE m.insumo_id = i.id));

UPDATE insumos SET activo = 0
WHERE nombre = 'espresso doble'
  AND EXISTS (SELECT 1 FROM movimientos_inventario m WHERE m.insumo_id = insumos.id);

DELETE FROM alertas_stock
WHERE insumo_id IN (
  SELECT i.id FROM insumos i
  WHERE i.nombre = 'espresso doble'
    AND NOT EXISTS (SELECT 1 FROM movimientos_inventario m WHERE m.insumo_id = i.id));

DELETE FROM insumos
WHERE nombre = 'espresso doble'
  AND NOT EXISTS (SELECT 1 FROM movimientos_inventario m WHERE m.insumo_id = insumos.id)
  AND NOT EXISTS (SELECT 1 FROM ingredientes g WHERE g.insumo_id = insumos.id);
