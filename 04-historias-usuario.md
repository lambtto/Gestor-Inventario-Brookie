# Historias de usuario

## HU-01 – Registrar venta

Como administrador, quiero que cada pedido confirmado registre la venta y descuente automáticamente los insumos utilizados según la receta de cada producto, para mantener actualizado el stock y conocer las ventas realizadas sin registros manuales.

**Actividad TO-BE:** Descontar insumos y registrar venta

### Criterios de aceptación

**CA1 – Descontar insumos**

Dado que existe un pedido confirmado y los productos tienen una receta definida, cuando se confirma el pedido, entonces se descuenta del stock de cada insumo la cantidad correspondiente según la receta y las unidades vendidas.

**CA2 – Registrar venta**

Dado que existe un pedido confirmado, cuando se confirma el pedido, entonces se registra la venta indicando el producto, la cantidad y el monto correspondiente.

**CA3 – Registro automático**

Dado que el sistema de toma de pedidos ha enviado un pedido confirmado, cuando se procesa la venta, entonces el descuento de insumos y el registro de la venta se realizan automáticamente, sin intervención del administrador.

**CA4 – Registrar movimiento de stock**

Dado que se ha realizado un descuento de insumos, cuando se actualiza el stock, entonces queda registrado un movimiento con la fecha, cantidad y pedido asociado.

**CA5 – Producto sin receta**

Dado que un producto del pedido no tiene una receta definida, cuando se confirma el pedido, entonces se registra la venta marcada como sin receta, se informa al administrador y no se descuentan los insumos correspondientes a ese producto.

**CA6 – Insumo desactivado**

Dado que un insumo desactivado todavía forma parte de la receta de un producto del pedido, cuando se confirma el pedido, entonces igualmente se descuenta su stock y se registra el Descuento, pero no se genera una alerta de stock crítico para ese insumo.

**CA7 – Insumos insuficientes**

Dado que a la receta de un producto del pedido no le alcanza el stock de algún insumo, cuando se confirma el pedido, entonces la venta de ese producto queda «Pendiente de confirmación», no se descuenta nada y se le avisa al administrador. Esto también aplica si el insumo que falta está desactivado.

---

## HU-02 – Alertar stock crítico

Como administrador, quiero recibir una alerta cuando un insumo llegue a su nivel mínimo, para comprarlo antes de quedarme sin stock.

**Actividad TO-BE:** Alertar stock crítico

### Criterios de aceptación

**CA1 – Generar alerta**

Dado que un insumo tiene definido un nivel mínimo, cuando su stock llega o baja de ese nivel, entonces se genera una alerta para el administrador.

**CA2 – Información de la alerta**

Dado que existe una alerta de stock, cuando el administrador la consulta, entonces puede identificar el insumo, su stock actual y su nivel mínimo.

**CA3 – Mantener alerta**

Dado que el stock de un insumo se encuentra en o bajo su nivel mínimo, cuando el administrador consulta las alertas, entonces la alerta permanece visible.

**CA4 – Eliminar alerta**

Dado que existe una alerta de stock para un insumo, cuando su stock vuelve a superar el nivel mínimo, entonces la alerta deja de mostrarse.

---

## HU-03 – Consultar stock

Como administrador, quiero consultar el stock actual de cada insumo, para decidir qué comprar sin tener que contar el inventario manualmente.

**Actividad TO-BE:** Revisar inventario, ventas y decidir reposición

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

Como administrador, quiero consultar un informe de las ventas y el consumo de insumos, para conocer los resultados de la operación y planificar la reposición.

**Actividad TO-BE:** Revisar inventario, ventas y decidir reposición

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

Como administrador, quiero registrar el ingreso de los insumos que compro, para mantener actualizado el inventario sin utilizar registros manuales externos.

**Actividad TO-BE:** Reabastecer stock

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

Como administrador, quiero registrar y mantener los insumos (editarlos, desactivarlos y reactivarlos) y definir la receta de cada producto, para disponer de la información necesaria para calcular los insumos utilizados en cada venta.

**Actividad TO-BE:** Registrar insumos y recetas

### Criterios de aceptación

**CA1 – Registrar insumo**

Dado que el administrador necesita incorporar un nuevo insumo, cuando registra el insumo, entonces debe indicar su nombre, unidad de medida, costo unitario en pesos chilenos (CLP) y stock mínimo.

**CA2 – Definir receta**

Dado que existe un producto, cuando el administrador define su receta, entonces puede indicar los insumos que la componen y la cantidad necesaria de cada uno.

**CA3 – Proteger insumos utilizados**

Dado que un insumo forma parte de una receta existente o tiene movimientos de inventario registrados, cuando el administrador intenta eliminarlo, entonces no puede eliminarlo y solo puede desactivarlo.

**CA4 – Mantener descuentos anteriores**

Dado que existe una receta utilizada en pedidos anteriores, cuando el administrador modifica dicha receta, entonces el cambio se aplica únicamente a los pedidos posteriores y no modifica los descuentos registrados anteriormente.

**CA5 – Editar insumo**

Dado que existe un insumo registrado, cuando el administrador lo edita, entonces puede cambiar su nombre, unidad de medida, costo unitario y stock mínimo con las mismas reglas del registro; si el nuevo stock mínimo deja el stock actual en o bajo el mínimo, el insumo pasa a stock crítico con una alerta vigente, y si lo deja sobre el mínimo, su alerta vigente se resuelve.

**CA6 – Reactivar insumo**

Dado que un insumo está desactivado, cuando el administrador lo reactiva, entonces vuelve a estar activo y puede usarse en recetas nuevas; si su stock está en o bajo el mínimo, queda en stock crítico con una alerta vigente nueva.

**CA7 – Validar nombre y costo**

Dado que el administrador registra o edita un insumo, cuando el nombre no contiene ninguna letra o el costo unitario no es un número entero de pesos mayor o igual a 0, entonces el sistema rechaza el registro e indica el motivo.

**CA8 – Formulario en ventana emergente**

Dado que el administrador está en la lista de insumos, cuando elige registrar o editar un insumo, entonces el formulario se abre en una ventana emergente centrada sobre la lista, sin cambiar de pantalla.

---

## HU-07 – Ajustar stock

Como administrador, quiero ajustar el stock de un insumo cuando hay mermas o cuando el conteo físico no coincide con el sistema, para que el inventario refleje lo que realmente hay en el local.

**Actividad TO-BE:** Ajustar stock

### Criterios de aceptación

**CA1 – Registrar merma**

Dado que se perdió parte de un insumo (vencido, derramado o dañado), cuando el administrador registra un ajuste con motivo «Merma» e indica la cantidad perdida en su unidad de medida, entonces el stock del insumo disminuye en esa cantidad.

**CA2 – Corregir conteo**

Dado que la cantidad contada físicamente de un insumo no coincide con su stock en el sistema, cuando el administrador registra un ajuste con motivo «Corrección de conteo» e indica la cantidad real contada, entonces el stock del insumo queda en esa cantidad y se registra la diferencia (positiva o negativa).

**CA3 – Registrar movimiento**

Dado que se realizó un ajuste de stock, cuando se confirma el registro, entonces queda registrado un movimiento con fecha, cantidad ajustada, motivo y usuario responsable.

**CA4 – Stock no negativo**

Dado que el administrador registra un ajuste, cuando la merma es mayor que el stock actual o la cantidad contada es negativa, entonces el sistema rechaza el ajuste e indica el motivo.

**CA5 – Actualizar alerta**

Dado que se realizó un ajuste de stock de un insumo activo, cuando el stock resultante queda en o bajo el mínimo, entonces se genera una alerta vigente si no la tenía; y cuando queda sobre el mínimo, su alerta vigente se resuelve.

---

## HU-08 – Resolver venta pendiente de insumos

Como administrador, quiero ver las ventas que quedaron pendientes por falta de insumos y poder confirmarlas cuando lleguen o cancelarlas si no los voy a conseguir, para que el stock solo baje cuando de verdad se puede preparar el producto.

**Actividad TO-BE:** Revisar inventario, ventas y decidir reposición; Reabastecer stock

### Criterios de aceptación

**CA1 – Ver ventas pendientes**

Dado que hay ventas «Pendiente de confirmación», cuando el administrador revisa las ventas pendientes, entonces ve el pedido, el producto, la cantidad y qué insumos faltan.

**CA2 – Confirmar venta**

Dado que una venta está pendiente y ya hay stock de todos los insumos de su receta, cuando el administrador la confirma, entonces se descuentan los insumos, se registran los Descuentos y la venta queda «Confirmada».

**CA3 – Confirmar sin stock**

Dado que una venta está pendiente y todavía falta algún insumo, cuando el administrador intenta confirmarla, entonces no se confirma, no se descuenta nada y la venta sigue pendiente.

**CA4 – Cancelar venta**

Dado que una venta está pendiente, cuando el administrador la cancela, entonces queda «Cancelada», no se descuenta nada y ya no aparece en las pendientes.

**CA5 – Solo se resuelven ventas pendientes**

Dado que una venta ya está «Confirmada» o «Cancelada», cuando el administrador intenta confirmarla o cancelarla, entonces el sistema no lo permite.
