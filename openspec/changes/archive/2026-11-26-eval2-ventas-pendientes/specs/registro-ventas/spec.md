## ADDED Requirements

### Requirement: Venta pendiente de insumos
Si la receta de un producto del pedido necesita más cantidad de algún insumo que la que hay en stock (incluso si ese insumo está desactivado), el sistema DEBE (MUST) registrar la Venta en estado «Pendiente de confirmación», NO DEBE (MUST NOT) descontar ningún insumo de esa receta ni registrar Descuentos, y DEBE (MUST) emitir «Aviso de venta pendiente de insumos (<producto>; faltan: …)» al Administrador. Los demás productos del pedido se evalúan por separado, con el stock que dejaron los anteriores, y el pedido se registra igual (HU-01 CA7, RP-15, DSS-01, EST-03; supuestos SV1–SV4).

#### Scenario: Pedido que excede los insumos existentes
- **GIVEN** la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
- **AND** hay 30 g de mantequilla
- **WHEN** el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
- **THEN** la venta queda «Pendiente de confirmación»
- **AND** la mantequilla sigue en 30 g
- **AND** no se registra ningún Descuento
- **AND** se le avisa al administrador que la venta quedó pendiente

#### Scenario: Pedido con un producto que alcanza y otro que no
- **GIVEN** Lemon Empire tiene stock suficiente y a SoHo le falta chocolate chip
- **WHEN** se confirma un pedido con ambos productos
- **THEN** la venta de Lemon Empire queda «Confirmada» con sus Descuentos y la de SoHo queda «Pendiente de confirmación» sin descontar nada

#### Scenario: Insumo desactivado que no alcanza
- **GIVEN** la vainilla está desactivada, forma parte de la receta y su stock no alcanza
- **WHEN** se confirma el pedido
- **THEN** la venta queda «Pendiente de confirmación» y no se descuenta nada

## MODIFIED Requirements

### Requirement: Alerta de stock crítico por un pedido
Al aplicar el evento «Pedido confirmado» a un insumo activo (solo cuando hay stock suficiente para la receta), si el stock resultante queda en o bajo el mínimo y el insumo no tiene alerta vigente, el sistema DEBE (MUST) generar una AlertaDeStock Vigente (Stock suficiente → Stock crítico). Si ya tenía una alerta vigente, NO DEBE (MUST NOT) generar otra. El stock de un insumo NUNCA DEBE (MUST NOT) quedar negativo por un pedido (DSS-02, EST-01, EST-02, RP-02, RP-15; reemplaza la decisión D1).

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
- **WHEN** se confirma un pedido que necesita 50 g de mantequilla
- **THEN** el stock ya no queda negativo: la mantequilla sigue en 30 g y la venta queda «Pendiente de confirmación» (reemplaza la decisión D1; ver «Pedido que excede los insumos existentes»)

### Requirement: Ver ventas y avisos
La pantalla «Ventas» DEBE (MUST) listar las ventas registradas (número de pedido, fecha, producto, cantidad, monto, si fue sin receta y su estado) y los avisos de producto sin receta. Solo el Administrador DEBE (MUST) poder abrirla (RP-09, decisión D3).

#### Scenario: El administrador ve la venta sin receta
- **GIVEN** se registró un pedido con 1 Banana Cloud, que no tiene receta
- **WHEN** el administrador abre «Ventas»
- **THEN** ve la venta de Banana Cloud marcada «Sin receta» y el aviso de producto sin receta

#### Scenario: Otro rol intenta ver las ventas
- **GIVEN** el rol de demostración es Barista
- **WHEN** abre «Ventas»
- **THEN** el sistema responde «Acceso solo para el administrador»
