# recetas-productos Specification

## Purpose
Permite al administrador definir y modificar la receta de cada producto (insumos, cantidades y rendimiento), que es la información con la que luego se calculan los insumos consumidos por cada venta (HU-06, CU-07).

## Requirements

### Requirement: Definir receta de un producto
El sistema DEBE (MUST) permitir al Administrador definir la receta de un producto existente indicando su rendimiento (unidades del producto que produce la receta) y uno o más ingredientes, cada uno con un insumo y la cantidad necesaria en la unidad de medida de ese insumo. Un producto tiene como máximo una receta.

#### Scenario: Definir la receta de un producto
- **GIVEN** existe el producto Café Latte
- **AND** existe el insumo leche
- **WHEN** el administrador define la receta del Café Latte con 250 ml de leche
- **THEN** la receta del Café Latte queda con 250 ml de leche
- **AND** el sistema responde «Receta guardada»

### Requirement: Validar receta
El sistema DEBE (MUST) rechazar una receta sin ingredientes, con alguna cantidad menor o igual a 0, con rendimiento menor o igual a 0, o con el mismo insumo repetido en dos líneas, mostrando el motivo y sin modificar la receta existente (modelo de dominio: Receta 1..* Ingrediente; decisión B).

#### Scenario: Receta sin ingredientes
- **GIVEN** existe el producto Capuchino
- **WHEN** el administrador intenta guardar la receta del Capuchino sin ingredientes
- **THEN** la receta no se guarda
- **AND** el sistema responde «Receta rechazada (debe tener al menos un ingrediente)»

#### Scenario: Cantidad inválida
- **WHEN** el administrador intenta guardar una receta con una cantidad de 0
- **THEN** la receta no se guarda
- **AND** el sistema responde «Receta rechazada (las cantidades y el rendimiento deben ser mayores que 0)»

### Requirement: Solo insumos activos en recetas
Al definir o modificar una receta, el sistema DEBE (MUST) ofrecer únicamente insumos activos para agregar. Si una receta ya contiene un insumo desactivado, el sistema DEBE (MUST) conservar esa línea al mostrarla y al guardarla sin cambios en ella (decisión C; HU-01 CA6).

#### Scenario: Insumo desactivado no se puede agregar
- **GIVEN** la canela está desactivada
- **WHEN** el administrador intenta agregar canela a la receta de un producto
- **THEN** la receta no se guarda
- **AND** el sistema responde «Receta rechazada (el insumo canela está desactivado)»

#### Scenario: Insumo desactivado ya presente se conserva
- **GIVEN** la mantequilla está desactivada y forma parte de la receta de Lemon Empire
- **WHEN** el administrador guarda la receta de Lemon Empire cambiando solo la cantidad de harina con polvos
- **THEN** la receta se guarda y conserva la línea de mantequilla

### Requirement: Modificar receta sin alterar descuentos anteriores
El sistema DEBE (MUST) permitir modificar una receta existente reemplazando su rendimiento e ingredientes. El cambio vale solo para pedidos posteriores: los Descuentos ya registrados guardan su propia cantidad y NO DEBEN (MUST NOT) cambiar (HU-06 CA4; las recetas no se versionan).

#### Scenario: Cambiar una receta no altera los Descuentos anteriores
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla por tanda de 10 galletas
- **AND** ayer un pedido de 2 Lemon Empire registró un Descuento de 50 g de mantequilla
- **WHEN** el administrador cambia la receta a 300 g de mantequilla por tanda
- **THEN** el Descuento de ayer sigue siendo de 50 g
- **AND** los pedidos posteriores descuentan 30 g de mantequilla por cada Lemon Empire (la receta queda en 300 g para un rendimiento de 10, es decir 30 g por unidad)

### Requirement: Ver productos y sus recetas
El sistema DEBE (MUST) mostrar al Administrador la lista de productos indicando si cada uno tiene receta o está «Sin receta», y permitir abrir la receta de un producto para verla y editarla.

#### Scenario: Producto sin receta
- **GIVEN** el producto Banana Cloud no tiene receta
- **WHEN** el administrador abre la pantalla «Recetas»
- **THEN** Banana Cloud aparece marcado «Sin receta»
