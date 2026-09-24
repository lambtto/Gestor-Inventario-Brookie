# Historias de usuario

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: las historias dependen de la tabla "Actividades que cambian" de 02-rediseno-to-be.md, que es una propuesta. Si el equipo cambia esa tabla, actualizar aquí el nombre de la actividad asociada y quitar la marca (prov.).
Criterio usado: una historia por cada tarea de usuario del TO-BE que cambia (HU-03 a HU-06). Las tareas de servicio no generan historia propia, pero HU-01 y HU-02 expresan el valor de esas tareas desde el punto de vista del administrador (como en el ejemplo de la clase). Los requisitos que las respaldan están en 03-requisitos.md.
Rendimiento: confirmado con el dueño que cada masa de galleta rinde 10 galletas por tanda (ver 05-elicitacion.md); HU-01 asume que el descuento se calcula dividiendo la receta por ese rendimiento.
Decisión pendiente: hoy todas las historias son del administrador. El dueño indicó que hay barista y personal de caja; decidir si alguno usa el sistema y merece historia propia.
Ganancia (HU-01, HU-04): se calcula como monto vendido menos costo de los insumos consumidos; por eso RP-06 ahora pide costo unitario del insumo, además de la unidad de medida y el stock mínimo. -->

## HU-01 – Registrar venta

**Como administrador, quiero registrar una venta y descontar automáticamente los insumos utilizados según la receta de cada producto, para mantener actualizado el stock y conocer las ventas realizadas sin registros manuales.**

**Actividad TO-BE:** Descontar insumos y registrar venta (prov.)

### Criterios de aceptación

**CA1 – Descontar insumos**

Dado que existe un pedido confirmado y los productos tienen una receta definida, cuando se confirma el pedido, entonces se descuenta del stock de cada insumo la cantidad correspondiente según la receta y las unidades vendidas.

**CA2 – Registrar venta**

Dado que existe un pedido confirmado, cuando se confirma el pedido, entonces se registra la venta indicando el producto, la cantidad y el monto correspondiente.

**CA3 – Registro automático**

Dado que el administrador ha confirmado un pedido, cuando se procesa la venta, entonces el descuento de insumos y el registro de la venta se realizan automáticamente, sin intervención adicional del administrador.

**CA4 – Registrar movimiento de stock**

Dado que se ha realizado un descuento de insumos, cuando se actualiza el stock, entonces queda registrado un movimiento con la fecha, cantidad y pedido asociado.

**CA5 – Producto sin receta**

Dado que un producto del pedido no tiene una receta definida, cuando se confirma el pedido, entonces se informa al administrador y no se descuentan los insumos correspondientes a ese producto.

---

## HU-02 – Alertar stock crítico

**Como administrador, quiero recibir una alerta cuando un insumo llegue a su nivel mínimo, para comprarlo antes de quedarme sin stock.**

**Actividad TO-BE:** Alertar stock crítico (prov.)

### Criterios de aceptación

**CA1 – Generar alerta**

Dado que un insumo tiene definido un nivel mínimo, cuando su stock llega o baja de ese nivel, entonces se genera una alerta para el administrador.

**CA2 – Información de la alerta**

Dado que existe una alerta de stock cuando el administrador la consulta, entonces puede identificar el insumo, su stock actual y su nivel mínimo.

**CA3 – Mantener alerta**

Dado que el stock de un insumo se encuentra en o bajo su nivel mínimo, cuando el administrador consulta las alertas, entonces la alerta permanece visible.

**CA4 – Eliminar alerta**

Dado que existe una alerta de stock para un insumo, cuando su stock vuelve a superar el nivel mínimo, entonces la alerta deja de mostrarse.

---

## HU-03 – Consultar stock

**Como administrador, quiero consultar el stock actual de cada insumo, para decidir qué comprar sin tener que contar el inventario manualmente.**

**Actividad TO-BE:** Revisar inventario, ventas y decidir reposición (prov.)

### Criterios de aceptación

**CA1 – Consultar inventario**

Dado que el administrador necesita revisar el inventario, cuando consulta el stock, entonces puede ver cada insumo junto con su stock actual, unidad de medida y nivel mínimo.

**CA2 – Mostrar stock actualizado**

Dado que se han registrado descuentos o reposiciones de insumos, cuando el administrador consulta el stock, entonces los valores mostrados consideran los movimientos registrados hasta ese momento.

**CA3 – Identificar stock crítico**

Dado que existen insumos cuyo stock se encuentra en o bajo su nivel mínimo, cuando el administrador consulta el inventario, entonces dichos insumos se distinguen visualmente del resto.

**CA4 – Control de acceso**

Dado que una persona intenta consultar el stock, cuando no posee el rol de administrador, entonces no puede acceder a la consulta de inventario.

---

## HU-04 – Consultar informe

**Como administrador, quiero consultar un informe de las ventas y el consumo de insumos, para conocer los resultados de la operación y planificar la reposición.**

**Actividad TO-BE:** Revisar inventario, ventas y decidir reposición (prov.)

### Criterios de aceptación

**CA1 – Consultar consumo**

Dado que existen movimientos de stock registrados durante un período, cuando el administrador consulta el informe, entonces puede ver por cada insumo el stock inicial, el consumo y el stock final del período.

**CA2 – Consultar ventas**

Dado que existen ventas registradas durante un período, cuando el administrador consulta el informe, entonces puede ver los productos vendidos, la cantidad de unidades y el monto total vendido.

**CA3 – Calcular ganancia**

Dado que existen ventas y consumos de insumos registrados durante un período, cuando el administrador consulta el informe, entonces se muestra la ganancia calculada como el monto total vendido menos el costo de los insumos consumidos.

**CA4 – Consultar por período**

Dado que el administrador necesita revisar información histórica, cuando selecciona un período de consulta, entonces puede consultar la información correspondiente a un día, una semana o un mes.

**CA5 – Validar stock**

Dado que existen movimientos de consumo y reposición registrados durante un período, cuando se consulta el informe, entonces el stock final corresponde al stock inicial menos el consumo más las reposiciones registradas.

---

## HU-05 – Registrar ingreso de stock

**Como administrador, quiero registrar el ingreso de los insumos que compro, para mantener actualizado el inventario sin utilizar registros manuales externos.**

**Actividad TO-BE:** Reabastecer stock (prov.)

### Criterios de aceptación

**CA1 – Registrar ingreso**

Dado que el administrador ha recibido un insumo comprado, cuando registra su ingreso, entonces debe indicar el insumo y la cantidad recibida en su unidad de medida correspondiente.

**CA2 – Actualizar stock**

Dado que se ha registrado correctamente un ingreso, cuando se confirma el registro, entonces el stock del insumo aumenta en la cantidad ingresada.

**CA3 – Registrar movimiento**

Dado que se ha realizado un ingreso de stock, cuando se confirma el registro, entonces queda registrado un movimiento con fecha, cantidad y usuario responsable.

**CA4 – Actualizar alerta**

Dado que un insumo tiene una alerta porque su stock está en o bajo el nivel mínimo, cuando se registra un ingreso que hace que el stock supere dicho nivel, entonces la alerta deja de mostrarse.

**CA5 – Facilidad de uso**

Dado que el administrador necesita registrar un ingreso de stock, cuando realiza el proceso de registro, entonces puede completarlo sin requerir conocimientos técnicos ni asistencia externa.

---

## HU-06 – Registrar insumos y recetas

**Como administrador, quiero registrar los insumos y definir la receta de cada producto, para disponer de la información necesaria para calcular los insumos utilizados en cada venta.**

**Actividad TO-BE:** Registrar insumos y recetas (prov.)

### Criterios de aceptación

**CA1 – Registrar insumo**

Dado que el administrador necesita incorporar un nuevo insumo, cuando registra el insumo, entonces debe indicar su nombre, unidad de medida, costo unitario y stock mínimo.

**CA2 – Definir receta**

Dado que existe un producto, cuando el administrador define su receta, entonces puede indicar los insumos que la componen y la cantidad necesaria de cada uno.

**CA3 – Proteger insumos utilizados**

Dado que un insumo forma parte de una receta existente, cuando el administrador intenta eliminarlo, entonces no puede eliminarlo y solo puede desactivarlo.

**CA4 – Mantener descuentos anteriores**

Dado que existe una receta utilizada en pedidos anteriores, cuando el administrador modifica dicha receta, entonces el cambio se aplica únicamente a los pedidos posteriores y no modifica los descuentos registrados anteriormente.
