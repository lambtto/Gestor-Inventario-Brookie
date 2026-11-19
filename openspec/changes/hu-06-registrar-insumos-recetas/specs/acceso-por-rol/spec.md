# Spec Delta

## Purpose

Distingue a las personas que usan el gestor (Administrador, Barista, Caja) mediante un selector de rol de demostración y restringe el módulo de inventario al Administrador (RP-09, supuesto S5), sin autenticación real.

## ADDED Requirements

### Requirement: Seleccionar rol de demostración
El sistema DEBE (MUST) mostrar en todas las páginas un selector con los roles Administrador, Barista y Caja, y recordar el rol elegido durante la navegación. Si no se eligió ninguno, el rol por defecto es Administrador.

#### Scenario: Cambiar de rol
- **GIVEN** el rol actual es Administrador
- **WHEN** la persona elige el rol Barista en el selector
- **THEN** las páginas siguientes se muestran con el rol Barista

### Requirement: Acceso exclusivo del administrador al inventario
El sistema DEBE (MUST) permitir las pantallas y acciones de insumos y recetas solo al rol Administrador. Con otro rol DEBE (MUST) responder «Acceso solo para el administrador» sin mostrar ni modificar datos.

#### Scenario: Barista intenta registrar un insumo
- **GIVEN** el rol actual es Barista
- **WHEN** intenta abrir la pantalla «Insumos» o registrar un insumo
- **THEN** el sistema responde «Acceso solo para el administrador»
- **AND** no se registra ningún insumo

#### Scenario: Caja intenta definir una receta
- **GIVEN** el rol actual es Caja
- **WHEN** intenta guardar la receta de un producto
- **THEN** el sistema responde «Acceso solo para el administrador»
- **AND** la receta no cambia
