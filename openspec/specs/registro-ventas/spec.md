# registro-ventas Specification

## Purpose
Permite que cada pedido confirmado que envía el Sistema de toma de pedidos registre automáticamente la venta y descuente los insumos según la receta de cada producto, dejando trazabilidad de los movimientos y generando las alertas de stock crítico que correspondan (HU-01, CU-01, DSS-01, DSS-02).

## Requirements

### Requirement: Recibir un pedido confirmado
El sistema DEBE (MUST) aceptar un «Pedido confirmado» con una o más líneas (producto, cantidad entera > 0, monto entero en CLP ≥ 0), registrar el Pedido con número correlativo, fecha y hora y monto total igual a la suma de las líneas, y responder «Pedido N° <número> registrado», sin intervención del administrador (CA3). El Sistema de toma de pedidos se simula con la pantalla «Simulador de pedidos», disponible para cualquier rol.

#### Scenario: El simulador envía un pedido confirmado
- **GIVEN** existen los productos Lemon Empire y Café Latte
- **WHEN** el simulador envía un pedido con 2 Lemon Empire por $7.000 y 1 Café Latte por $3.500
- **THEN** queda registrado un Pedido con monto total $10.500, su número y su fecha y hora
- **AND** el sistema responde «Pedido N° 1 registrado»

#### Scenario: Pedido con datos inválidos
- **WHEN** el simulador envía un pedido sin líneas, con una cantidad que no es un entero mayor que 0 o con un monto que no es un entero mayor o igual a 0
- **THEN** el sistema responde «Pedido rechazado (dato faltante o inválido)»
- **AND** no se registra ningún pedido, venta ni descuento, y el stock no cambia

### Requirement: Registrar la venta de cada producto
Por cada línea del pedido confirmado, el sistema DEBE (MUST) registrar una Venta asociada al Pedido con el producto, la cantidad y el monto de esa línea (CA2, RP-01).

#### Scenario: Venta registrada con producto, cantidad y monto
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
- **THEN** queda registrada la venta de 2 Lemon Empire por $7.000

### Requirement: Descontar insumos según la receta
Si el producto de una línea tiene receta, el sistema DEBE (MUST) descontar del stock de cada insumo de la receta la cantidad del ingrediente × unidades vendidas ÷ rendimiento de la receta, en la unidad de medida del insumo y admitiendo decimales (CA1). El descuento DEBE (MUST) aplicarse aunque deje el stock negativo, porque el pedido ya fue vendido (decisión A).

#### Scenario: Pedido confirmado cuyos productos tienen receta
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **AND** el stock de mantequilla es de 1000 g
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
- **THEN** el stock de mantequilla queda en 950 g
- **AND** se descuentan, en la misma proporción, los demás insumos de la receta
- **AND** queda registrada la venta de 2 Lemon Empire por $7.000
- **AND** queda registrado un Descuento de 50 g de mantequilla con su fecha y el pedido asociado

#### Scenario: El descuento deja el stock negativo
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **AND** el stock de mantequilla es de 0 g
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire
- **THEN** el pedido queda registrado
- **AND** el stock de mantequilla queda en -50 g

### Requirement: Registrar el movimiento de stock
Por cada insumo descontado, el sistema DEBE (MUST) registrar un movimiento de inventario de tipo Descuento con la fecha, la cantidad descontada y el pedido asociado (CA4, RP-08).

#### Scenario: Descuento asociado al pedido
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire
- **THEN** queda registrado un Descuento de 50 g de mantequilla con su fecha y el número de ese pedido

### Requirement: Producto sin receta
Si el producto de una línea no tiene receta definida, el sistema DEBE (MUST) registrar la Venta marcada como sin receta, NO DEBE (MUST NOT) descontar insumos por ese producto y DEBE (MUST) informar al administrador que el producto no tiene receta (CA5). El aviso se muestra en la pantalla «Ventas» con el producto y el número de pedido.

#### Scenario: Pedido con un producto sin receta
- **GIVEN** el Café Latte no tiene receta definida
- **AND** el stock de leche es de 5000 ml
- **WHEN** el sistema de toma de pedidos confirma un pedido de 1 Café Latte
- **THEN** se informa al administrador que el Café Latte no tiene receta
- **AND** queda registrada la venta de 1 Café Latte marcada como sin receta
- **AND** el stock de leche sigue en 5000 ml

### Requirement: Alerta de stock crítico por pedido
Tras el descuento, si un insumo activo queda con stock menor o igual a su nivel mínimo y no tiene una alerta vigente, el sistema DEBE (MUST) generar una AlertaDeStock en estado «Vigente» y el insumo pasa a «Stock crítico» (EST-01, EST-02, DSS-02). Si ya tenía una alerta vigente, NO DEBE (MUST NOT) generar otra (decisión B).

#### Scenario: Un pedido deja el insumo en stock crítico
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **AND** la mantequilla tiene 1000 g de stock, un stock mínimo de 960 g y ninguna alerta vigente
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire
- **THEN** el stock de mantequilla queda en 950 g
- **AND** la mantequilla tiene una alerta de stock crítico vigente

#### Scenario: Un insumo ya en stock crítico no recibe una segunda alerta
- **GIVEN** la mantequilla tiene 100 g de stock, un stock mínimo de 500 g y una alerta vigente
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire
- **THEN** el stock de mantequilla queda en 50 g
- **AND** la mantequilla sigue teniendo una sola alerta vigente

### Requirement: Insumo desactivado en una receta
Si un insumo desactivado todavía forma parte de la receta de un producto del pedido, el sistema DEBE (MUST) descontar igualmente su stock y registrar el Descuento, pero NO DEBE (MUST NOT) generar una alerta de stock crítico para ese insumo; el insumo permanece «Desactivado» (CA6).

#### Scenario: Pedido que usa un insumo desactivado
- **GIVEN** la vainilla está desactivada y forma parte de la receta de Lemon Empire
- **AND** el nivel mínimo de la vainilla es de 5 cucharaditas y su stock es de 5 cucharaditas
- **WHEN** el sistema de toma de pedidos confirma un pedido de 10 Lemon Empire
- **THEN** el stock de vainilla queda en 4 cucharaditas
- **AND** queda registrado un Descuento de 1 cucharadita de vainilla
- **AND** no se genera una alerta de stock crítico para la vainilla

### Requirement: Consultar las ventas registradas
El sistema DEBE (MUST) ofrecer al Administrador la pantalla «Ventas», que muestra arriba los avisos de producto sin receta (producto y número de pedido) y debajo los pedidos registrados, del más reciente al más antiguo, con su número, fecha y hora, monto total, sus ventas (producto, cantidad, monto y la marca «sin receta») y sus Descuentos (insumo, cantidad y unidad). Con otro rol DEBE (MUST) responder «Acceso solo para el administrador» sin mostrar datos (RP-09).

#### Scenario: El administrador ve el pedido registrado
- **GIVEN** se registró un pedido de 2 Lemon Empire por $7.000
- **WHEN** el administrador abre la pantalla «Ventas»
- **THEN** ve el pedido con su número, fecha y monto total $7.000, la venta de 2 Lemon Empire por $7.000 y el Descuento de 50 g de mantequilla

#### Scenario: Barista intenta ver las ventas
- **GIVEN** el rol de demostración es Barista
- **WHEN** intenta abrir la pantalla «Ventas»
- **THEN** el sistema responde «Acceso solo para el administrador»
