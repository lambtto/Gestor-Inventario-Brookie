# Criterios de aceptación (Gherkin)

Escenarios en Gherkin para las 6 historias de usuario de [04-historias-usuario.md](./04-historias-usuario.md) de la Entrega 1. Cada historia tiene al menos un escenario principal y uno alternativo o de error, redactados en el lenguaje del negocio (sin mencionar pantallas, botones ni campos de formulario).

## HU-01 — Registrar venta

Historia: Como administrador, quiero registrar una venta y descontar automáticamente los insumos utilizados según la receta de cada producto, para mantener actualizado el stock y conocer las ventas realizadas sin registros manuales.

```gherkin
Característica: Descuento automático de insumos y registro de venta al confirmar un pedido

  Escenario: Se descuenta el stock y se registra la venta de un pedido con receta completa
    Dado un pedido confirmado cuyos productos tienen receta definida
    Cuando se confirma el pedido
    Entonces se descuenta del stock de cada insumo la cantidad que indica la receta
    Y se registra la venta con el producto, la cantidad y el monto correspondiente
    Y queda registrado un movimiento de stock con la fecha, la cantidad y el pedido asociado

  Escenario: Un producto del pedido no tiene receta definida
    Dado un pedido confirmado que incluye un producto sin receta registrada
    Cuando se confirma el pedido
    Entonces se informa al administrador que el producto no tiene receta
    Y no se descuentan insumos para ese producto
```

## HU-02 — Alertar stock crítico

Historia: Como administrador, quiero recibir una alerta cuando un insumo llegue a su nivel mínimo, para comprarlo antes de quedarme sin stock.

```gherkin
Característica: Alerta de stock crítico

  Escenario: El stock de un insumo llega a su nivel mínimo
    Dado que el insumo "Leche" tiene un nivel mínimo definido
    Y su stock actual llega a ese nivel mínimo
    Cuando el administrador consulta las alertas de stock crítico
    Entonces ve una alerta que identifica el insumo, su stock actual y su nivel mínimo

  Escenario: El stock del insumo vuelve a superar el nivel mínimo
    Dado que el insumo "Leche" tiene una alerta activa
    Cuando se registra un ingreso de stock que deja el insumo sobre su nivel mínimo
    Entonces la alerta deja de mostrarse
```

## HU-03 — Consultar stock

Historia: Como administrador, quiero consultar el stock actual de cada insumo, para decidir qué comprar sin tener que contar el inventario manualmente.

```gherkin
Característica: Consulta de stock en tiempo real

  Escenario: El administrador consulta el stock de los insumos
    Dado que existen insumos registrados con sus movimientos de stock al día
    Cuando el administrador consulta el stock
    Entonces ve cada insumo con su stock actual, su unidad de medida y su nivel mínimo
    Y los insumos en o bajo su nivel mínimo se distinguen del resto

  Escenario: Una persona sin rol de administrador intenta consultar el stock
    Dado que una persona no tiene el rol de administrador
    Cuando intenta consultar el stock
    Entonces el sistema no le permite acceder a la consulta de inventario
```

## HU-04 — Consultar informe

Historia: Como administrador, quiero consultar un informe de las ventas y el consumo de insumos, para conocer los resultados de la operación y planificar la reposición.

```gherkin
Característica: Informe de ventas, consumo y ganancia por período

  Escenario: El administrador consulta el informe de un período con movimientos registrados
    Dado que existen ventas y movimientos de stock registrados durante un período
    Cuando el administrador consulta el informe de ese período
    Entonces ve, por cada insumo, el stock inicial, el consumo y el stock final
    Y ve los productos vendidos, las unidades vendidas y el monto total vendido
    Y ve la ganancia del período, calculada como el monto vendido menos el costo de los insumos consumidos

  Escenario: El administrador consulta un período sin ventas registradas
    Dado que no se registraron ventas durante el período consultado
    Cuando el administrador consulta el informe de ese período
    Entonces el informe muestra el consumo y el stock en cero para ese período
    Y no se calcula ganancia
```

## HU-05 — Registrar ingreso de stock

Historia: Como administrador, quiero registrar el ingreso de los insumos que compro, para mantener actualizado el inventario sin utilizar registros manuales externos.

```gherkin
Característica: Registro de ingreso de stock

  Escenario: El administrador registra la reposición de un insumo
    Dado que el administrador recibió una cantidad de un insumo que compró
    Cuando registra el ingreso indicando el insumo y la cantidad recibida
    Entonces el stock del insumo aumenta en la cantidad ingresada
    Y queda registrado un movimiento con fecha, cantidad y el administrador responsable

  Escenario: Se intenta registrar un ingreso sin una cantidad válida o de un insumo desactivado
    Dado que el administrador recibió un insumo
    Y no indica la cantidad recibida, o la cantidad no es mayor que cero, o el insumo está desactivado
    Cuando intenta registrar el ingreso
    Entonces el ingreso se rechaza indicando el motivo
    Y el stock del insumo no cambia

  Escenario: El ingreso registrado deja al insumo sobre su nivel mínimo
    Dado que el insumo "Café molido" tiene una alerta activa por stock bajo el mínimo
    Cuando se registra un ingreso que deja el stock sobre el nivel mínimo
    Entonces la alerta del insumo deja de mostrarse
```

## HU-06 — Registrar insumos y recetas

Historia: Como administrador, quiero registrar los insumos y definir la receta de cada producto, para disponer de la información necesaria para calcular los insumos utilizados en cada venta.

```gherkin
Característica: Registro de insumos y definición de recetas

  Escenario: El administrador define la receta de un producto nuevo
    Dado que existe un producto sin receta definida
    Cuando el administrador define su receta indicando los insumos y la cantidad de cada uno
    Entonces el producto queda con una receta asociada para el descuento automático

  Escenario: Falta un dato al registrar un insumo
    Dado que el administrador quiere incorporar un nuevo insumo
    Y no indica alguno de estos datos: nombre, unidad de medida, costo unitario o stock mínimo
    Cuando intenta registrar el insumo
    Entonces el registro se rechaza indicando el dato faltante

  Escenario: El administrador intenta eliminar un insumo que está en uso
    Dado que un insumo forma parte de la receta de un producto
    Cuando el administrador intenta eliminarlo
    Entonces el sistema no permite eliminarlo
    Y solo permite desactivarlo
```
