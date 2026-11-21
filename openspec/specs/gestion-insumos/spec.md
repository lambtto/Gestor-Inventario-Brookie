# gestion-insumos Specification

## Purpose
Permite al administrador de Brookies Coffee registrar los insumos con los que se preparan los productos y darlos de baja (eliminar o desactivar) sin perder la trazabilidad del inventario (HU-06, CU-06, CU-08).

## Requirements

### Requirement: Registrar insumo
El sistema DEBE (MUST) permitir al Administrador registrar un insumo indicando nombre, unidad de medida, costo unitario en pesos chilenos (CLP) y stock mínimo. El insumo registrado DEBE (MUST) quedar activo, con stock 0 y, por lo tanto, en estado «Stock crítico» (EST-01). La unidad de medida se guarda tal como la escribe el administrador, sin conversiones.

#### Scenario: Registrar un insumo nuevo
- **GIVEN** el insumo azúcar rubia no está registrado
- **WHEN** el administrador registra el insumo azúcar rubia con unidad de medida en gramos, costo unitario de $2 CLP por gramo y stock mínimo de 500 g
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
El sistema DEBE (MUST) rechazar el registro si el nombre no contiene ninguna letra, si ya existe un insumo con el mismo nombre (sin distinguir mayúsculas ni espacios de los extremos), si el costo unitario no es un número entero de pesos mayor o igual a 0, o si el stock mínimo es negativo o no numérico, mostrando el motivo y sin registrar nada (HU-06 CA7, decisión B).

#### Scenario: Nombre repetido
- **GIVEN** existe el insumo «leche»
- **WHEN** el administrador intenta registrar el insumo «Leche»
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (ya existe un insumo con ese nombre)»

#### Scenario: Costo negativo
- **WHEN** el administrador intenta registrar un insumo con costo unitario -1
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (el costo unitario debe ser un número entero de pesos, CLP, mayor o igual a 0)»

#### Scenario: Registrar un insumo con un nombre sin letras
- **GIVEN** el administrador está registrando un insumo
- **WHEN** intenta registrar el insumo «123» con unidad de medida en gramos, costo unitario de $2 CLP y stock mínimo de 100 g
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (el nombre debe contener al menos una letra)»

#### Scenario: Registrar un insumo con costo en decimales
- **GIVEN** el insumo azúcar flor no está registrado
- **WHEN** el administrador intenta registrarlo con un costo unitario de $2,5 CLP por gramo
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (el costo unitario debe ser un número entero de pesos, CLP, mayor o igual a 0)»

#### Scenario: Stock mínimo negativo
- **WHEN** el administrador intenta registrar un insumo con stock mínimo -5
- **THEN** el insumo no queda registrado
- **AND** el sistema responde «Registro rechazado (el stock mínimo debe ser un número mayor o igual a 0)»

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
El sistema DEBE (MUST) mostrar al Administrador la lista de insumos con su nombre, unidad de medida, costo unitario en formato CLP (signo $ y punto de miles, sin decimales), stock mínimo y si está Activo o Desactivado. Cada insumo ofrece «Editar» y «Eliminar», más «Desactivar» si está activo o «Reactivar» si está desactivado. La lista no muestra stock ni alertas (corresponden a HU-03 y HU-02).

#### Scenario: Ver la lista de insumos
- **GIVEN** existen los insumos leche (activo) y canela (desactivado)
- **WHEN** el administrador abre la pantalla «Insumos»
- **THEN** ve ambos insumos con sus cuatro datos
- **AND** la leche aparece como «Activo» con la acción «Desactivar»
- **AND** la canela aparece como «Desactivado» con la acción «Reactivar»

#### Scenario: Costo en formato CLP
- **GIVEN** existe el insumo vainilla con costo unitario 1250
- **WHEN** el administrador abre la pantalla «Insumos»
- **THEN** el costo de la vainilla se muestra como «$1.250»

### Requirement: Editar insumo
El sistema DEBE (MUST) permitir al Administrador editar el nombre, la unidad de medida, el costo unitario y el stock mínimo de un insumo, activo o desactivado, con las mismas reglas del registro (dato faltante, nombre con al menos una letra y no repetido entre los demás insumos, costo entero en CLP, mínimo ≥ 0). Si se acepta, responde «Insumo actualizado»; si no, «Edición rechazada (<motivo>)» y no cambia nada (HU-06 CA5, CU-09).

#### Scenario: Editar el costo de un insumo
- **GIVEN** la mantequilla tiene un costo unitario de $12 CLP por gramo
- **WHEN** el administrador edita la mantequilla y cambia su costo unitario a $15 CLP por gramo
- **THEN** la mantequilla queda con un costo unitario de $15 CLP por gramo
- **AND** el sistema responde «Insumo actualizado»

#### Scenario: Editar con un nombre de otro insumo
- **GIVEN** existen los insumos leche y mantequilla
- **WHEN** el administrador edita la mantequilla y cambia su nombre a «LECHE»
- **THEN** la mantequilla conserva su nombre
- **AND** el sistema responde «Edición rechazada (ya existe un insumo con ese nombre)»

#### Scenario: Editar un insumo desactivado
- **GIVEN** la canela está desactivada
- **WHEN** el administrador edita la canela y cambia su costo unitario a $25 CLP
- **THEN** la canela queda con un costo unitario de $25 CLP
- **AND** sigue desactivada y sin alerta vigente

### Requirement: Recalcular alerta al editar el stock mínimo
Al editar un insumo activo, el sistema DEBE (MUST) recalcular su estado con el nuevo stock mínimo: si el stock queda en o bajo el mínimo y no tenía alerta vigente, pasa a «Stock crítico» y se genera una alerta «Vigente»; si queda sobre el mínimo, su alerta vigente pasa a «Resuelta» (EST-01, EST-02). Un insumo desactivado no cambia de estado ni genera alerta.

#### Scenario: Subir el stock mínimo sobre el stock actual
- **GIVEN** la canela tiene 500 g de stock, un stock mínimo de 100 g y ninguna alerta vigente
- **WHEN** el administrador edita la canela y cambia su stock mínimo a 600 g
- **THEN** la canela queda con un stock mínimo de 600 g
- **AND** tiene una alerta de stock crítico vigente

#### Scenario: Bajar el stock mínimo bajo el stock actual
- **GIVEN** la canela tiene 500 g de stock, un stock mínimo de 600 g y una alerta vigente
- **WHEN** el administrador edita la canela y cambia su stock mínimo a 100 g
- **THEN** la canela queda en «Stock suficiente»
- **AND** su alerta deja de estar vigente

### Requirement: Reactivar insumo
El sistema DEBE (MUST) permitir al Administrador reactivar un insumo desactivado: el insumo vuelve a estar activo y se puede elegir en recetas nuevas. Si su stock está en o bajo el mínimo, pasa a «Stock crítico» y se genera una alerta «Vigente» nueva; si no, pasa a «Stock suficiente» (EST-01, EST-02). El sistema responde «Insumo reactivado» (HU-06 CA6, CU-10). Reactivar un insumo que ya está activo se rechaza con «El insumo ya está activo».

#### Scenario: Reactivar un insumo desactivado con stock crítico
- **GIVEN** la mantequilla está desactivada, con 0 g de stock y un stock mínimo de 500 g
- **WHEN** el administrador reactiva la mantequilla
- **THEN** la mantequilla queda activa
- **AND** tiene una alerta de stock crítico vigente nueva
- **AND** el sistema responde «Insumo reactivado»

#### Scenario: Reactivar un insumo con stock suficiente
- **GIVEN** la canela está desactivada, con 500 g de stock y un stock mínimo de 100 g
- **WHEN** el administrador reactiva la canela
- **THEN** la canela queda en «Stock suficiente»
- **AND** no tiene alerta vigente

### Requirement: Formulario de insumo en ventana emergente
En la pantalla «Insumos», los formularios para registrar y para editar un insumo DEBEN (MUST) abrirse en una ventana emergente centrada sobre la lista, sin cambiar de pantalla. Si el registro o la edición se rechazan, la ventana DEBE (MUST) mostrarse abierta con el motivo y los datos escritos (HU-06 CA8).

#### Scenario: El formulario de insumo se abre en una ventana emergente
- **GIVEN** el administrador está en la lista de insumos
- **WHEN** elige registrar un insumo
- **THEN** el formulario se abre en una ventana emergente centrada sobre la lista

#### Scenario: La ventana se reabre con el motivo del rechazo
- **WHEN** el administrador intenta registrar el insumo «123»
- **THEN** la pantalla «Insumos» se muestra con la ventana de registro abierta
- **AND** la ventana muestra «Registro rechazado (el nombre debe contener al menos una letra)» y el nombre «123» escrito
