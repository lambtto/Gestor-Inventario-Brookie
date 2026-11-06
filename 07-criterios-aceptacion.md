# Criterios de aceptación (Gherkin)

Escenarios en Gherkin para las seis historias de [04-historias-usuario.md](./04-historias-usuario.md) de la Entrega 1. Cada historia tiene un escenario principal y al menos uno alternativo o de error, escritos con los términos del [modelo de dominio](./08-modelo-dominio.md) (Insumo, Producto, Receta, Pedido, Venta, Descuento, Reposición, alerta de stock crítico) y sin mencionar pantallas ni botones. Los montos y stocks son ejemplos para poder verificar cada escenario; las cantidades de las recetas salen del cuaderno del dueño (ver [05-elicitacion.md](./05-elicitacion.md)).

## HU-01 — Registrar venta

Historia: Como administrador, quiero que cada pedido confirmado registre la venta y descuente automáticamente los insumos utilizados según la receta de cada producto, para mantener actualizado el stock y conocer las ventas realizadas sin registros manuales.

```gherkin
Característica: Registrar venta y descontar insumos de un pedido confirmado

  Escenario: Pedido confirmado cuyos productos tienen receta
    Dado que la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
    Y que el stock de mantequilla es de 1000 g
    Cuando el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
    Entonces el stock de mantequilla queda en 950 g
    Y se descuentan, en la misma proporción, los demás insumos de la receta
    Y queda registrada la venta de 2 Lemon Empire por $7.000
    Y queda registrado un Descuento de 50 g de mantequilla con su fecha y el pedido asociado

  Escenario: Pedido con un producto sin receta
    Dado que el Café Latte no tiene receta definida
    Y que el stock de leche es de 5000 ml
    Cuando el sistema de toma de pedidos confirma un pedido de 1 Café Latte
    Entonces se informa al administrador que el Café Latte no tiene receta
    Y queda registrada la venta de 1 Café Latte marcada como sin receta
    Y el stock de leche sigue en 5000 ml

  Escenario: Pedido que usa un insumo desactivado
    Dado que la vainilla está desactivada y forma parte de la receta de Lemon Empire
    Y que el nivel mínimo de la vainilla es de 5 cucharaditas y su stock es de 5 cucharaditas
    Cuando el sistema de toma de pedidos confirma un pedido de 10 Lemon Empire
    Entonces el stock de vainilla queda en 4 cucharaditas
    Y queda registrado un Descuento de 1 cucharadita de vainilla
    Y no se genera una alerta de stock crítico para la vainilla
```

## HU-02 — Alertar stock crítico

Historia: Como administrador, quiero recibir una alerta cuando un insumo llegue a su nivel mínimo, para comprarlo antes de quedarme sin stock.

```gherkin
Característica: Alertar stock crítico

  Escenario: Un pedido deja un insumo en su nivel mínimo
    Dado que el nivel mínimo de la mantequilla es de 500 g
    Y que el stock de mantequilla es de 550 g
    Y que la mantequilla no tiene una alerta vigente
    Cuando se confirma un pedido que descuenta 50 g de mantequilla
    Entonces se genera una alerta de stock crítico vigente para la mantequilla

  Escenario: El insumo ya tiene una alerta vigente
    Dado que existe una alerta vigente para la mantequilla, con un stock de 500 g y un nivel mínimo de 500 g
    Cuando se confirma otro pedido que descuenta 50 g de mantequilla
    Entonces no se genera una nueva alerta para la mantequilla
    Y la alerta vigente se mantiene

  Escenario: El administrador consulta la alerta
    Dado que existe una alerta vigente para la mantequilla, con un stock de 500 g y un nivel mínimo de 500 g
    Cuando el administrador consulta las alertas de stock crítico
    Entonces ve la mantequilla con su stock actual de 500 g
    Y ve su nivel mínimo de 500 g

  Escenario: La alerta se mantiene mientras el stock siga en o bajo el mínimo
    Dado que existe una alerta vigente para la mantequilla
    Y que no se han registrado reposiciones de mantequilla
    Cuando el administrador consulta las alertas de stock crítico al día siguiente
    Entonces la alerta de la mantequilla sigue vigente

  Escenario: La alerta termina cuando el stock supera el mínimo
    Dado que existe una alerta vigente para la mantequilla, con un stock de 500 g y un nivel mínimo de 500 g
    Cuando se registra una Reposición de 1000 g de mantequilla
    Entonces el stock de mantequilla queda en 1500 g
    Y la alerta de la mantequilla deja de estar vigente

  Escenario: Un insumo sobre su nivel mínimo no genera alerta
    Dado que el nivel mínimo de la mantequilla es de 500 g
    Y que el stock de mantequilla es de 1000 g
    Cuando se confirma un pedido que descuenta 50 g de mantequilla
    Entonces no se genera ninguna alerta para la mantequilla
```

## HU-03 — Consultar stock

Historia: Como administrador, quiero consultar el stock actual de cada insumo, para decidir qué comprar sin tener que contar el inventario manualmente.

```gherkin
Característica: Consultar stock

  Escenario: El administrador revisa el inventario
    Dado que la mantequilla tiene un stock de 950 g y un nivel mínimo de 500 g
    Y que la leche tiene un stock de 5000 ml y un nivel mínimo de 1000 ml
    Cuando el administrador consulta el stock
    Entonces ve cada insumo con su stock actual, su unidad de medida y su nivel mínimo

  Escenario: El stock considera todos los movimientos registrados
    Dado que el stock inicial de leche era de 5000 ml
    Y que un Descuento restó 250 ml
    Y que se registró una Reposición de 2000 ml
    Cuando el administrador consulta el stock
    Entonces la leche figura con un stock de 6750 ml

  Escenario: Los insumos en stock crítico se distinguen del resto
    Dado que la mantequilla tiene un stock de 500 g y un nivel mínimo de 500 g
    Y que la leche tiene un stock de 5000 ml y un nivel mínimo de 1000 ml
    Cuando el administrador consulta el stock
    Entonces la mantequilla figura como stock crítico
    Y la leche no figura como stock crítico

  Escenario: Una persona sin rol de administrador intenta consultar el stock
    Dado que una persona no tiene el rol de administrador
    Cuando intenta consultar el stock
    Entonces no puede acceder a la consulta de inventario
```

## HU-04 — Consultar informe

Historia: Como administrador, quiero consultar un informe de las ventas y el consumo de insumos, para conocer los resultados de la operación y planificar la reposición.

```gherkin
Característica: Consultar informe de ventas y consumo

  Escenario: Consumo de un insumo en el día
    Dado que al comenzar el día el stock de leche era de 5000 ml
    Y que durante el día los Descuentos de leche sumaron 1500 ml
    Y que no hubo Reposiciones de leche
    Cuando el administrador consulta el informe del día
    Entonces ve para la leche un stock inicial de 5000 ml, un consumo de 1500 ml y un stock final de 3500 ml

  Escenario: Ventas del día
    Dado que durante el día se vendieron 12 Lemon Empire y 8 Café Latte por un monto total de $100.000
    Cuando el administrador consulta el informe del día
    Entonces ve los productos vendidos con sus unidades
    Y ve un monto total vendido de $100.000

  Escenario: Ganancia del día
    Dado que el monto total vendido en el día es de $100.000
    Y que el costo de los insumos consumidos en el día es de $35.000
    Cuando el administrador consulta el informe del día
    Entonces la ganancia que ve es de $65.000

  Escenario: El stock final considera las Reposiciones
    Dado que al comenzar el día el stock de leche era de 5000 ml
    Y que los Descuentos de leche sumaron 1500 ml
    Y que se registró una Reposición de 2000 ml
    Cuando el administrador consulta el informe del día
    Entonces el stock final de leche es de 5500 ml

  Escenario: Informe de una semana
    Dado que el lunes se vendieron 10 Lemon Empire por $35.000
    Y que el martes se vendieron 6 Lemon Empire por $21.000
    Cuando el administrador consulta el informe de esa semana
    Entonces ve 16 Lemon Empire vendidas por un monto total de $56.000

  Escenario: Período sin ventas
    Dado que el stock de leche era de 5000 ml al comenzar el período
    Y que no hubo Ventas ni Reposiciones durante el período
    Cuando el administrador consulta el informe de ese período
    Entonces ve un monto total vendido de $0
    Y el stock final de leche es de 5000 ml
```

## HU-05 — Registrar ingreso de stock

Historia: Como administrador, quiero registrar el ingreso de los insumos que compro, para mantener actualizado el inventario sin utilizar registros manuales externos.

```gherkin
Característica: Registrar ingreso de stock

  Escenario: Ingreso de un insumo comprado
    Dado que el stock de mantequilla es de 500 g
    Cuando el administrador registra el ingreso de 1000 g de mantequilla
    Entonces el stock de mantequilla queda en 1500 g
    Y queda registrada una Reposición con su fecha, 1000 g de cantidad y el administrador como responsable

  Escenario: El ingreso levanta una alerta vigente
    Dado que existe una alerta vigente para la mantequilla, con un stock de 500 g y un nivel mínimo de 500 g
    Cuando el administrador registra el ingreso de 1000 g de mantequilla
    Entonces la alerta de la mantequilla deja de estar vigente

  Escenario: Ingreso sin indicar la cantidad recibida
    Dado que el stock de mantequilla es de 500 g
    Cuando el administrador intenta registrar un ingreso de mantequilla sin indicar la cantidad recibida
    Entonces el ingreso no se registra
    Y el stock de mantequilla sigue en 500 g
```

## HU-06 — Registrar insumos y recetas

Historia: Como administrador, quiero registrar los insumos y definir la receta de cada producto, para disponer de la información necesaria para calcular los insumos utilizados en cada venta.

```gherkin
Característica: Registrar insumos y recetas

  Escenario: Registrar un insumo nuevo
    Dado que el insumo azúcar rubia no está registrado
    Cuando el administrador registra el insumo azúcar rubia con unidad de medida en gramos, costo unitario de $2 por gramo y stock mínimo de 500 g
    Entonces el insumo azúcar rubia queda registrado con esos cuatro datos
    Y su stock queda en 0 g con una alerta de stock crítico vigente

  Escenario: Registrar un insumo sin unidad de medida
    Dado que el insumo azúcar rubia no está registrado
    Cuando el administrador intenta registrar el insumo azúcar rubia sin indicar su unidad de medida
    Entonces el insumo no queda registrado

  Escenario: Definir la receta de un producto
    Dado que existe el producto Café Latte
    Y que existe el insumo leche
    Cuando el administrador define la receta del Café Latte con 250 ml de leche
    Entonces la receta del Café Latte queda con 250 ml de leche

  Escenario: Un insumo usado en una receta no se puede eliminar
    Dado que la mantequilla forma parte de la receta de Lemon Empire
    Cuando el administrador intenta eliminar la mantequilla
    Entonces la mantequilla no se elimina
    Y el administrador solo puede desactivarla

  Escenario: Un insumo con movimientos registrados no se puede eliminar
    Dado que la canela no forma parte de ninguna receta
    Y que la canela tiene registrada una Reposición de 500 g
    Cuando el administrador intenta eliminar la canela
    Entonces la canela no se elimina
    Y el administrador solo puede desactivarla

  Escenario: Desactivar un insumo con alerta vigente
    Dado que la mantequilla tiene una alerta vigente
    Cuando el administrador desactiva la mantequilla
    Entonces la mantequilla queda desactivada
    Y su alerta deja de estar vigente

  Escenario: Cambiar una receta no altera los Descuentos anteriores
    Dado que la receta de Lemon Empire usa 250 g de mantequilla por tanda de 10 galletas
    Y que ayer un pedido de 2 Lemon Empire registró un Descuento de 50 g de mantequilla
    Cuando el administrador cambia la receta a 300 g de mantequilla por tanda
    Entonces el Descuento de ayer sigue siendo de 50 g
    Y los pedidos posteriores descuentan 30 g de mantequilla por cada Lemon Empire
```
