# Spec Delta

## Purpose

Permite al administrador de Brookies Coffee registrar el ingreso de los insumos que compra, dejando la Reposición registrada y manteniendo al día el estado del insumo y su alerta de stock crítico (HU-05, CU-05, DSS-03, EST-01, EST-02).

## ADDED Requirements

### Requirement: Registrar el ingreso de un insumo comprado
El sistema DEBE (MUST) permitir al Administrador registrar un ingreso indicando el insumo y la cantidad recibida en su unidad de medida. El stock del insumo DEBE (MUST) aumentar en esa cantidad, DEBE (MUST) quedar registrada una Reposición con su fecha, la cantidad y el usuario responsable, y el sistema responde «Ingreso registrado (stock actualizado: <stock> <unidad>)» (HU-05 CA1, CA2, CA3; RP-05, RP-08).

#### Scenario: Ingreso de un insumo comprado
- **GIVEN** el stock de mantequilla es de 500 g
- **WHEN** el administrador registra el ingreso de 1000 g de mantequilla
- **THEN** el stock de mantequilla queda en 1500 g
- **AND** queda registrada una Reposición con su fecha, 1000 g de cantidad y el administrador como responsable

#### Scenario: Ver la reposición en la lista
- **GIVEN** el administrador registró el ingreso de 1000 g de mantequilla
- **WHEN** abre la pantalla «Registrar ingreso»
- **THEN** ve en la lista de reposiciones la mantequilla con «1000 g» y responsable «Administrador»

### Requirement: Resolver la alerta al superar el mínimo
Si el insumo está en Stock crítico y el ingreso deja su stock sobre el nivel mínimo, su alerta vigente DEBE (MUST) quedar resuelta (Stock crítico → Stock suficiente; AlertaDeStock Vigente → Resuelta). Si el stock sigue en o bajo el mínimo, la alerta DEBE (MUST) seguir vigente (HU-05 CA4, DSS-03, EST-01, EST-02).

#### Scenario: El ingreso levanta una alerta vigente
- **GIVEN** existe una alerta vigente para la mantequilla, con un stock de 500 g y un nivel mínimo de 500 g
- **WHEN** el administrador registra el ingreso de 1000 g de mantequilla
- **THEN** la alerta de la mantequilla deja de estar vigente

#### Scenario: El ingreso no alcanza a superar el mínimo
- **GIVEN** la mantequilla tiene 200 g de stock, un nivel mínimo de 500 g y una alerta vigente
- **WHEN** el administrador registra el ingreso de 100 g de mantequilla
- **THEN** el stock de mantequilla queda en 300 g
- **AND** la alerta de la mantequilla sigue vigente

### Requirement: Rechazar un ingreso inválido
El sistema DEBE (MUST) rechazar el ingreso, sin cambiar el stock ni registrar una Reposición, cuando falta la cantidad recibida, falta el insumo, la cantidad no es un número mayor que 0 o el insumo está desactivado (EST-01 no modela «Registrar ingreso» desde Desactivado). Cada rechazo responde «Ingreso rechazado (<motivo>)» (DSS-03, decisiones D2 y D3).

#### Scenario: Ingreso sin indicar la cantidad recibida
- **GIVEN** el stock de mantequilla es de 500 g
- **WHEN** el administrador intenta registrar un ingreso de mantequilla sin indicar la cantidad recibida
- **THEN** el ingreso no se registra
- **AND** el stock de mantequilla sigue en 500 g

#### Scenario: Cantidad no válida
- **WHEN** el administrador registra un ingreso de 0 g o de -5 g de mantequilla
- **THEN** el sistema responde «Ingreso rechazado (la cantidad recibida debe ser mayor que 0)» y el stock no cambia

#### Scenario: Insumo desactivado
- **GIVEN** la canela está desactivada
- **WHEN** el administrador registra el ingreso de 500 g de canela
- **THEN** el sistema responde «Ingreso rechazado (insumo desactivado)» y el stock no cambia

### Requirement: Solo el administrador registra ingresos
Solo el Administrador DEBE (MUST) poder abrir «Registrar ingreso» y registrar un ingreso (RP-09).

#### Scenario: Otro rol intenta registrar un ingreso
- **GIVEN** el rol de demostración es Caja
- **WHEN** intenta registrar el ingreso de 1000 g de mantequilla
- **THEN** el sistema responde «Acceso solo para el administrador» y el stock no cambia
