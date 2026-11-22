# registro-ventas Specification

## Purpose

Registra cada pedido confirmado que envía el Sistema de toma de pedidos: sus ventas, el descuento de los insumos según la receta de cada producto y el efecto sobre el estado del insumo y su alerta (HU-01, CU-01, DSS-01, DSS-02, EST-01, EST-02).

## Requirements

### Requirement: Descontar insumos y registrar la venta
Al recibir un «Pedido confirmado», el sistema DEBE (MUST) registrar el Pedido (número, fechaHora, montoTotal) y, por cada producto con receta, descontar del stock de cada insumo de la receta la cantidad del ingrediente ÷ rendimiento × unidades vendidas, registrar un Descuento por insumo con su fecha, cantidad y pedido asociado, y registrar la Venta con su cantidad y monto. El sistema responde «Pedido registrado» (HU-01 CA1, CA2, CA3, CA4; RP-01, RP-08).

#### Scenario: Pedido confirmado cuyos productos tienen receta
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **AND** el stock de mantequilla es de 1000 g
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
- **THEN** el stock de mantequilla queda en 950 g
- **AND** se descuentan, en la misma proporción, los demás insumos de la receta
- **AND** queda registrada la venta de 2 Lemon Empire por $7.000
- **AND** queda registrado un Descuento de 50 g de mantequilla con su fecha y el pedido asociado

#### Scenario: Pedido con varios productos
- **GIVEN** Lemon Empire y SoHo tienen receta
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000 y 1 SoHo por $3.000
- **THEN** queda registrado un Pedido con monto total de $10.000 y dos Ventas
- **AND** se descuentan los insumos de ambas recetas

### Requirement: Producto sin receta
Si un producto del pedido no tiene receta, el sistema DEBE (MUST) registrar su Venta marcada como sin receta, NO DEBE (MUST NOT) descontar insumos por ese producto y DEBE (MUST) emitir «Aviso de producto sin receta (<producto>)» al Administrador, visible en la respuesta al pedido y en la pantalla «Ventas» (HU-01 CA5, supuesto S2, decisión D3).

#### Scenario: Pedido con un producto sin receta
- **GIVEN** el Banana Cloud no tiene receta definida
- **AND** el stock de leche es de 5000 ml
- **WHEN** el sistema de toma de pedidos confirma un pedido de 1 Banana Cloud
- **THEN** se informa al administrador que el Banana Cloud no tiene receta
- **AND** queda registrada la venta de 1 Banana Cloud marcada como sin receta
- **AND** el stock de leche sigue en 5000 ml

### Requirement: Insumo desactivado en la receta
Un insumo desactivado que todavía forma parte de la receta DEBE (MUST) descontarse y registrar su Descuento, pero NO DEBE (MUST NOT) generar una alerta de stock crítico; el insumo sigue Desactivado (HU-01 CA6, EST-01).

#### Scenario: Pedido que usa un insumo desactivado
- **GIVEN** la vainilla está desactivada y forma parte de la receta de Lemon Empire
- **AND** el nivel mínimo de la vainilla es de 5 cucharaditas y su stock es de 5 cucharaditas
- **WHEN** el sistema de toma de pedidos confirma un pedido de 10 Lemon Empire
- **THEN** el stock de vainilla queda en 4 cucharaditas
- **AND** queda registrado un Descuento de 1 cucharadita de vainilla
- **AND** no se genera una alerta de stock crítico para la vainilla

### Requirement: Alerta de stock crítico por un pedido
Al aplicar el evento «Pedido confirmado» a un insumo activo, si el stock resultante queda en o bajo el mínimo y el insumo no tiene alerta vigente, el sistema DEBE (MUST) generar una AlertaDeStock Vigente (Stock suficiente → Stock crítico). Si ya tenía una alerta vigente, NO DEBE (MUST NOT) generar otra (DSS-02, EST-01, EST-02, RP-02).

#### Scenario: El pedido deja un insumo activo en su mínimo
- **GIVEN** el nivel mínimo de la mantequilla es de 500 g, su stock es de 550 g y no tiene alerta vigente
- **WHEN** se confirma un pedido que descuenta 50 g de mantequilla
- **THEN** la mantequilla queda en Stock crítico con una alerta vigente

#### Scenario: El insumo ya tenía una alerta vigente
- **GIVEN** la mantequilla está en Stock crítico con una alerta vigente
- **WHEN** se confirma otro pedido que descuenta mantequilla
- **THEN** la mantequilla sigue con una sola alerta vigente

#### Scenario: El pedido deja el stock negativo
- **GIVEN** la mantequilla tiene 30 g de stock
- **WHEN** se confirma un pedido que descuenta 50 g de mantequilla
- **THEN** el pedido se registra y el stock de mantequilla queda en -20 g con una alerta vigente (decisión D1)

### Requirement: Rechazar un pedido inválido
El sistema DEBE (MUST) rechazar el pedido completo, sin registrar ventas ni descuentos, cuando falta el número o no es un entero > 0, no trae productos, un producto no existe, una cantidad no es un entero > 0, un monto no es un entero ≥ 0, o el número de pedido ya fue registrado. Cada rechazo responde «Pedido rechazado (<motivo>)» (decisión D2).

#### Scenario: Pedido repetido
- **GIVEN** el pedido número 15 ya fue registrado
- **WHEN** el sistema de toma de pedidos vuelve a enviar el pedido número 15
- **THEN** el sistema responde «Pedido rechazado (pedido ya registrado)»
- **AND** el stock no vuelve a descontarse

#### Scenario: Producto inexistente
- **WHEN** llega un pedido con un producto que no existe
- **THEN** el sistema responde «Pedido rechazado (producto no encontrado: <nombre>)» y no registra nada

### Requirement: Ver ventas y avisos
La pantalla «Ventas» DEBE (MUST) listar las ventas registradas (número de pedido, fecha, producto, cantidad, monto y si fue sin receta) y los avisos de producto sin receta. Solo el Administrador DEBE (MUST) poder abrirla (RP-09, decisión D3).

#### Scenario: El administrador ve la venta sin receta
- **GIVEN** se registró un pedido con 1 Banana Cloud, que no tiene receta
- **WHEN** el administrador abre «Ventas»
- **THEN** ve la venta de Banana Cloud marcada «Sin receta» y el aviso de producto sin receta

#### Scenario: Otro rol intenta ver las ventas
- **GIVEN** el rol de demostración es Barista
- **WHEN** abre «Ventas»
- **THEN** el sistema responde «Acceso solo para el administrador»
