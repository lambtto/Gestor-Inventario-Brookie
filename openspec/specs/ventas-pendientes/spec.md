# ventas-pendientes Specification

## Purpose
Permite al Administrador consultar, confirmar y cancelar las ventas que quedaron «Pendiente de confirmación» por falta de insumos (HU-08, CU-12 a CU-14, DSS-07, EST-03; cambio de requerimientos de la Evaluación 2, RP-15).

## Requirements

### Requirement: Ver ventas pendientes
La pantalla «Ventas pendientes» DEBE (MUST) listar las Ventas en estado «Pendiente de confirmación» con el número de pedido, el producto, la cantidad y los insumos que faltan (calculados con el stock actual). Solo el Administrador DEBE (MUST) poder usarla (HU-08 CA1, CU-12, DSS-07, RP-09).

#### Scenario: Ver las ventas pendientes
- **GIVEN** la venta de 2 Lemon Empire del pedido 15 está «Pendiente de confirmación»
- **AND** le faltan 20 g de mantequilla
- **WHEN** el administrador revisa las ventas pendientes
- **THEN** ve la venta del pedido 15 con 2 Lemon Empire
- **AND** ve que falta mantequilla

#### Scenario: Solo el administrador resuelve ventas pendientes
- **GIVEN** el rol de demostración es Caja
- **WHEN** intenta ver, confirmar o cancelar una venta pendiente
- **THEN** el sistema responde «Acceso solo para el administrador» y la venta sigue pendiente

### Requirement: Confirmar venta pendiente
Al confirmar una venta «Pendiente de confirmación» con stock suficiente de todos los insumos de su receta, el sistema DEBE (MUST) descontar los insumos, registrar un Descuento por insumo asociado a la Venta, aplicar el evento «Confirmar venta» de EST-01 / EST-02 (alerta si un insumo activo queda en o bajo su mínimo) y dejar la venta «Confirmada». Si todavía falta stock, DEBE (MUST) responder «Confirmación rechazada (faltan: …)» sin descontar nada (HU-08 CA2, CA3; CU-13; EST-03).

#### Scenario: Confirmar una venta cuando llegan los insumos
- **GIVEN** la venta de 2 Lemon Empire está «Pendiente de confirmación»
- **AND** había 30 g de mantequilla y se registró una Reposición de 1000 g
- **WHEN** el administrador confirma la venta
- **THEN** la mantequilla queda en 980 g
- **AND** queda registrado un Descuento de 50 g de mantequilla
- **AND** la venta queda «Confirmada»

#### Scenario: Confirmar sin stock suficiente
- **GIVEN** la venta de 2 Lemon Empire está «Pendiente de confirmación»
- **AND** sigue habiendo 30 g de mantequilla
- **WHEN** el administrador intenta confirmar la venta
- **THEN** no se confirma y se indica que falta mantequilla
- **AND** la mantequilla sigue en 30 g
- **AND** la venta sigue «Pendiente de confirmación»

#### Scenario: Confirmar deja un insumo en su mínimo
- **GIVEN** una venta pendiente cuya confirmación deja la mantequilla en o bajo su mínimo
- **WHEN** el administrador la confirma
- **THEN** se genera la alerta de stock crítico de la mantequilla

### Requirement: Cancelar venta pendiente
Al cancelar una venta «Pendiente de confirmación», el sistema DEBE (MUST) dejarla «Cancelada» sin descontar nada; deja de aparecer en las pendientes (HU-08 CA4, CU-14, EST-03).

#### Scenario: Cancelar una venta pendiente
- **GIVEN** la venta de 2 Lemon Empire está «Pendiente de confirmación»
- **AND** hay 30 g de mantequilla
- **WHEN** el administrador cancela la venta
- **THEN** la venta queda «Cancelada»
- **AND** la mantequilla sigue en 30 g
- **AND** la venta ya no aparece en las pendientes

### Requirement: Solo se resuelven ventas pendientes
Confirmar o cancelar una venta «Confirmada» o «Cancelada» DEBE (MUST) rechazarse con «Confirmación rechazada (la venta no está pendiente)» o «Cancelación rechazada (la venta no está pendiente)» (HU-08 CA5, EST-03: transición no modelada).

#### Scenario: No se puede confirmar una venta cancelada
- **GIVEN** la venta de 2 Lemon Empire está «Cancelada»
- **WHEN** el administrador intenta confirmarla
- **THEN** el sistema no lo permite porque la venta ya no está pendiente

#### Scenario: No se puede cancelar una venta confirmada
- **GIVEN** una venta «Confirmada»
- **WHEN** el administrador intenta cancelarla
- **THEN** el sistema no lo permite porque la venta ya no está pendiente
