-- Ajuste HU-06 (cambio ajuste-hu-06-editar-reactivar-validaciones), RP-06 y 08-modelo-dominio.md:
-- el costo unitario es un número entero de pesos chilenos (CLP). Se redondean los costos ya guardados
-- (decisión L de la ficha: 1,5 → 2; 1,2 → 1; 0,5 → 1; 0,01 → 0). La regla de entero se valida al registrar y editar.
UPDATE insumos SET costo_unitario = ROUND(costo_unitario) WHERE costo_unitario <> ROUND(costo_unitario);
