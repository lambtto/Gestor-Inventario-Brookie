# Spec Delta

## Purpose

Permite al administrador de Brookies Coffee ajustar el stock de un insumo cuando hay mermas o cuando el conteo físico no coincide con el sistema, dejando registro del ajuste y manteniendo al día el estado del insumo y su alerta (HU-07, CU-11, DSS-06).

## ADDED Requirements

### Requirement: Registrar merma
El sistema DEBE (MUST) permitir al Administrador registrar un ajuste con motivo «Merma» indicando el insumo y la cantidad perdida en su unidad de medida. El stock del insumo DEBE (MUST) disminuir en esa cantidad y el sistema responde «Ajuste registrado (stock actualizado: <stock> <unidad>)» (HU-07 CA1).

#### Scenario: Registrar una merma
- **GIVEN** la leche tiene 2000 ml de stock y un stock mínimo de 500 ml
- **WHEN** el administrador registra un ajuste de la leche con motivo «Merma» por 300 ml
- **THEN** el stock de la leche queda en 1700 ml
- **AND** queda registrado un ajuste de -300 ml con motivo «Merma», la fecha y el administrador como responsable
- **AND** el sistema responde «Ajuste registrado (stock actualizado: 1700 ml)»

### Requirement: Corregir conteo
El sistema DEBE (MUST) permitir al Administrador registrar un ajuste con motivo «Corrección de conteo» indicando la cantidad real contada. El stock del insumo DEBE (MUST) quedar en esa cantidad y el ajuste registra la diferencia (cantidad contada − stock anterior), positiva, negativa o 0 (HU-07 CA2, decisión D4).

#### Scenario: Corregir el conteo hacia arriba
- **GIVEN** la harina tiene 1000 g de stock en el sistema
- **WHEN** el administrador registra un ajuste de la harina con motivo «Corrección de conteo» y una cantidad contada de 1200 g
- **THEN** el stock de la harina queda en 1200 g
- **AND** queda registrado un ajuste de +200 g con motivo «Corrección de conteo»

#### Scenario: Corregir el conteo hacia abajo
- **GIVEN** la harina tiene 1000 g de stock en el sistema
- **WHEN** el administrador registra una corrección de conteo de la harina con 950 g contados
- **THEN** el stock de la harina queda en 950 g
- **AND** queda registrado un ajuste de -50 g con motivo «Corrección de conteo»

#### Scenario: Corrección igual al stock actual
- **GIVEN** la harina tiene 1000 g de stock en el sistema
- **WHEN** el administrador registra una corrección de conteo de la harina con 1000 g contados
- **THEN** el stock de la harina sigue en 1000 g
- **AND** queda registrado un ajuste de 0 g con motivo «Corrección de conteo»

### Requirement: Registrar el movimiento de ajuste
Cada ajuste aceptado DEBE (MUST) quedar registrado como movimiento de inventario de tipo «Ajuste» con su fecha, la cantidad ajustada con signo, el motivo y el usuario responsable (rol de demostración). La pantalla «Ajustar stock» DEBE (MUST) listar los ajustes registrados con fecha, insumo, motivo, cantidad con signo y unidad, y responsable (HU-07 CA3, RP-08, decisión D1).

#### Scenario: Ver el ajuste en la lista
- **GIVEN** el administrador registró una merma de 300 ml de leche
- **WHEN** abre la pantalla «Ajustar stock»
- **THEN** ve en la lista de ajustes la leche con motivo «Merma», cantidad «-300 ml» y responsable «Administrador»

### Requirement: Stock no negativo
El sistema DEBE (MUST) rechazar un ajuste, sin cambiar el stock ni registrar nada, cuando la merma es mayor que el stock actual, la merma es 0 o negativa, la cantidad contada es negativa, o falta el insumo, el motivo o la cantidad (o no es un número). Cada rechazo responde «Ajuste rechazado (<motivo>)» (HU-07 CA4, RP-14, decisión D3).

#### Scenario: Una merma mayor que el stock se rechaza
- **GIVEN** la leche tiene 200 ml de stock
- **WHEN** el administrador intenta registrar una merma de 300 ml de leche
- **THEN** el ajuste no queda registrado
- **AND** el stock de la leche sigue en 200 ml
- **AND** el sistema responde «Ajuste rechazado (la cantidad supera el stock)»

#### Scenario: Merma de cero
- **GIVEN** la leche tiene 200 ml de stock
- **WHEN** el administrador intenta registrar una merma de 0 ml de leche
- **THEN** el ajuste no queda registrado
- **AND** el sistema responde «Ajuste rechazado (la cantidad perdida debe ser mayor que 0)»

#### Scenario: Cantidad contada negativa
- **WHEN** el administrador intenta registrar una corrección de conteo de la harina con -10 g contados
- **THEN** el ajuste no queda registrado
- **AND** el sistema responde «Ajuste rechazado (la cantidad contada no puede ser negativa)»

#### Scenario: Ajuste sin cantidad
- **WHEN** el administrador intenta registrar una merma de leche sin indicar la cantidad
- **THEN** el ajuste no queda registrado
- **AND** el sistema responde «Ajuste rechazado (dato faltante)»

### Requirement: Actualizar alerta con el ajuste
Si el insumo está activo, el sistema DEBE (MUST) recalcular su estado con el stock resultante: si queda en o bajo el mínimo y no tenía alerta vigente, pasa a «Stock crítico» y se genera una alerta «Vigente»; si queda sobre el mínimo, su alerta vigente pasa a «Resuelta». Un insumo desactivado se ajusta sin generar ni resolver alertas (HU-07 CA5, EST-01, EST-02).

#### Scenario: Una merma deja el insumo en stock crítico
- **GIVEN** la leche tiene 600 ml de stock, un stock mínimo de 500 ml y ninguna alerta vigente
- **WHEN** el administrador registra una merma de 200 ml de leche
- **THEN** el stock de la leche queda en 400 ml
- **AND** la leche tiene una alerta de stock crítico vigente

#### Scenario: Una corrección de conteo resuelve la alerta
- **GIVEN** la harina tiene 100 g de stock, un stock mínimo de 500 g y una alerta vigente
- **WHEN** el administrador registra una corrección de conteo de la harina con 800 g contados
- **THEN** el stock de la harina queda en 800 g
- **AND** su alerta deja de estar vigente

#### Scenario: Ajustar un insumo desactivado
- **GIVEN** la canela está desactivada, con 500 g de stock y un stock mínimo de 100 g
- **WHEN** el administrador registra una merma de 450 g de canela
- **THEN** el stock de la canela queda en 50 g
- **AND** la canela sigue desactivada y sin alerta vigente

### Requirement: Pantalla «Ajustar stock»
El sistema DEBE (MUST) ofrecer la pantalla «Ajustar stock» en el menú, solo para el Administrador (RP-09). El selector de insumos DEBE (MUST) mostrar el stock actual de cada insumo con su unidad (por ejemplo, «leche (2000 ml)»), y el formulario pide motivo («Merma» o «Corrección de conteo») y cantidad (decisiones D1 y D2).

#### Scenario: Ver el stock en el selector
- **GIVEN** la leche tiene 2000 ml de stock
- **WHEN** el administrador abre la pantalla «Ajustar stock»
- **THEN** el selector de insumos muestra «leche (2000 ml)»
- **AND** el formulario ofrece los motivos «Merma» y «Corrección de conteo»

#### Scenario: Solo el administrador ajusta stock
- **GIVEN** el rol de demostración seleccionado es Barista
- **WHEN** intenta abrir la pantalla «Ajustar stock» o registrar un ajuste
- **THEN** el sistema responde «Acceso solo para el administrador»
- **AND** no se registra ningún ajuste
