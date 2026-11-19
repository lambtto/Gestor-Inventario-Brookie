# Spec Delta

## Purpose

Permite al administrador de Brookies Coffee registrar los insumos con los que se preparan los productos y darlos de baja (eliminar o desactivar) sin perder la trazabilidad del inventario (HU-06, CU-06, CU-08).

## ADDED Requirements

### Requirement: Registrar insumo
El sistema DEBE (MUST) permitir al Administrador registrar un insumo indicando nombre, unidad de medida, costo unitario y stock mínimo. El insumo registrado DEBE (MUST) quedar activo, con stock 0 y, por lo tanto, en estado «Stock crítico» (EST-01). La unidad de medida se guarda tal como la escribe el administrador, sin conversiones.

#### Scenario: Registrar un insumo nuevo
- **GIVEN** el insumo azúcar rubia no está registrado
- **WHEN** el administrador registra el insumo azúcar rubia con unidad de medida en gramos, costo unitario de $2 por gramo y stock mínimo de 500 g
- **THEN** el insumo azúcar rubia queda registrado con esos cuatro datos
- **AND** su stock queda en 0 g con una alerta de stock crítico vigente
- **AND** el sistema responde «Insumo registrado»

### Requirement: Generar alerta al registrar insumo
Al registrar un insumo, el sistema DEBE (MUST) generar una AlertaDeStock en estado «Vigente» para ese insumo, con su fecha de generación (EST-02, transición inicial «Registrar insumo»).

#### Scenario: Alerta creada con el insumo
- **WHEN** el administrador registra un insumo nuevo
- **THEN** existe exactamente una alerta de stock «Vigente» asociada a ese insumo

### Requirement: Rechazar registro incompleto
El sistema DEBE (MUST) rechazar el registro de un insumo si falta cualquiera de los cuatro datos (nombre, unidad de medida, costo unitario, stock mínimo), respondiendo «Registro rechazado (dato faltante)» y sin registrar nada (DSS-04).

#### Scenario: Registrar un insumo sin unidad de medida
- **GIVEN** el insumo azúcar rubia no está registrado
- **WHEN** el administrador intenta registrar el insumo azúcar rubia sin indicar su unidad de medida
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (dato faltante)»

### Requirement: Validar datos del insumo
El sistema DEBE (MUST) rechazar el registro si ya existe un insumo con el mismo nombre (sin distinguir mayúsculas ni espacios de los extremos), o si el costo unitario o el stock mínimo son negativos o no numéricos, mostrando el motivo y sin registrar nada (decisión B de la validación).

#### Scenario: Nombre repetido
- **GIVEN** existe el insumo «leche»
- **WHEN** el administrador intenta registrar el insumo «Leche»
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (ya existe un insumo con ese nombre)»

#### Scenario: Costo negativo
- **WHEN** el administrador intenta registrar un insumo con costo unitario -1
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (el costo unitario y el stock mínimo deben ser números mayores o iguales a 0)»

### Requirement: Eliminar insumo sin historia
El sistema DEBE (MUST) permitir eliminar un insumo que no forma parte de ninguna receta y no tiene movimientos de inventario, desde cualquiera de sus estados. Al eliminarlo DEBE (MUST) eliminar también sus alertas y responder «Insumo eliminado» (EST-01, EST-02, DSS-05).

#### Scenario: Eliminar un insumo sin recetas ni movimientos
- **GIVEN** el insumo azúcar flor no forma parte de ninguna receta y no tiene movimientos
- **AND** tiene una alerta vigente
- **WHEN** el administrador elimina el azúcar flor
- **THEN** el azúcar flor ya no existe
- **AND** su alerta tampoco existe
- **AND** el sistema responde «Insumo eliminado»

### Requirement: Proteger insumos utilizados
El sistema NO DEBE (MUST NOT) eliminar un insumo que forma parte de alguna receta o que tiene movimientos de inventario (Descuento o Reposición). En ese caso DEBE (MUST) responder «Eliminación rechazada (solo se puede desactivar)» y ofrecer desactivarlo (HU-06 CA3, DSS-05).

#### Scenario: Un insumo usado en una receta no se puede eliminar
- **GIVEN** la mantequilla forma parte de la receta de Lemon Empire
- **WHEN** el administrador intenta eliminar la mantequilla
- **THEN** la mantequilla no se elimina
- **AND** el administrador solo puede desactivarla

#### Scenario: Un insumo con movimientos registrados no se puede eliminar
- **GIVEN** la canela no forma parte de ninguna receta
- **AND** la canela tiene registrada una Reposición de 500 g
- **WHEN** el administrador intenta eliminar la canela
- **THEN** la canela no se elimina
- **AND** el administrador solo puede desactivarla

### Requirement: Desactivar insumo
El sistema DEBE (MUST) permitir desactivar un insumo activo. El insumo pasa a «Desactivado» y, si tenía una alerta «Vigente», esta pasa a «Resuelta» (EST-01, EST-02). El sistema responde «Insumo desactivado». Desactivar no borra el insumo ni sus recetas ni sus movimientos.

#### Scenario: Desactivar un insumo con alerta vigente
- **GIVEN** la mantequilla tiene una alerta vigente
- **WHEN** el administrador desactiva la mantequilla
- **THEN** la mantequilla queda desactivada
- **AND** su alerta deja de estar vigente

### Requirement: Listar insumos
El sistema DEBE (MUST) mostrar al Administrador la lista de insumos con su nombre, unidad de medida, costo unitario, stock mínimo y si está Activo o Desactivado, con las acciones Eliminar y Desactivar. La lista no muestra stock ni alertas (corresponden a HU-03 y HU-02).

#### Scenario: Ver la lista de insumos
- **GIVEN** existen los insumos leche (activo) y canela (desactivado)
- **WHEN** el administrador abre la pantalla «Insumos»
- **THEN** ve ambos insumos con sus cuatro datos
- **AND** la leche aparece como «Activo» y la canela como «Desactivado»
