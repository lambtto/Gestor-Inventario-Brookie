# Historias de usuario

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: las historias dependen de la tabla "Actividades que cambian" de 02-rediseno-to-be.md, que es una propuesta. Si el equipo cambia esa tabla, actualizar aquí el nombre de la actividad asociada y quitar la marca (prov.).
Criterio usado: una historia por cada tarea de usuario del TO-BE que cambia (HU-03 a HU-06). Las tareas de servicio no generan historia propia, pero HU-01 y HU-02 expresan el valor de esas tareas desde el punto de vista del administrador (como en el ejemplo de la clase). Los requisitos que las respaldan están en 03-requisitos.md.
Pendiente: HU-01 supone que la receta es por unidad vendida; las recetas del cuaderno son por tanda y no indican rendimiento (ver 05-elicitacion.md).
Decisión pendiente: hoy todas las historias son del administrador. El dueño indicó que hay barista y personal de caja; decidir si alguno usa el sistema y merece historia propia. -->

## HU-01
Como administrador, quiero que el sistema descuente automáticamente los insumos de cada pedido según su receta, para conocer el stock real sin contar ni anotar a mano.
**Actividad TO-BE asociada:** Descontar insumos según receta (prov.)
**Criterios de aceptación:**
- CA1: Al confirmarse un pedido, el sistema descuenta del stock cada insumo de la receta de cada producto pedido, con la cantidad definida en la receta por cada unidad vendida.
- CA2: El descuento ocurre sin intervención del administrador y termina en 1 segundo o menos.
- CA3: Cada descuento queda registrado como un movimiento con fecha, cantidad y pedido asociado.
- CA4: Si un producto del pedido no tiene receta definida, el sistema avisa al administrador y no descuenta nada para ese producto.

## HU-02
Como administrador, quiero recibir una alerta cuando un insumo llegue a su nivel mínimo, para comprarlo antes de quedarme sin stock.
**Actividad TO-BE asociada:** Alertar stock crítico (prov.)
**Criterios de aceptación:**
- CA1: Cuando el stock de un insumo llega o baja del mínimo que definió el administrador, el sistema genera una alerta.
- CA2: La alerta indica el insumo, su stock actual y su nivel mínimo.
- CA3: La alerta queda visible para el administrador en el sistema mientras el stock siga en o bajo el mínimo.
- CA4: Cuando el stock vuelve a superar el mínimo, la alerta deja de mostrarse.

## HU-03
Como administrador, quiero ver el stock actual de cada insumo en tiempo real, para decidir qué comprar sin tener que contar a mano.
**Actividad TO-BE asociada:** Revisar inventario y decidir reposición (prov.)
**Criterios de aceptación:**
- CA1: El administrador ve el listado de insumos con su stock actual, unidad de medida y nivel mínimo.
- CA2: El stock mostrado incluye todos los descuentos y reposiciones ya registrados, y la consulta responde en 1 segundo o menos.
- CA3: Los insumos que están en o bajo su nivel mínimo se distinguen visualmente del resto.
- CA4: Solo un usuario con rol de administrador puede acceder a esta consulta.

## HU-04
Como administrador, quiero recibir un informe al cierre del día con el stock inicial, el stock final y el consumo de cada insumo, para saber qué faltará al día siguiente.
**Actividad TO-BE asociada:** Revisar inventario y decidir reposición (prov.)
**Criterios de aceptación:**
- CA1: Al cierre del día, el administrador puede obtener un informe con, por cada insumo, el stock inicial, el stock final y el consumo del día.
- CA2: El administrador puede consultar el consumo de cada insumo por día, por semana y por mes.
- CA3: Los valores del informe son consistentes con los movimientos registrados: stock inicial, menos consumo, más reposiciones, es igual al stock final.

## HU-05
Como administrador, quiero registrar el ingreso de stock cuando llegan los insumos que compré, para mantener el inventario actualizado sin usar planillas.
**Actividad TO-BE asociada:** Reabastecer stock (prov.)
**Criterios de aceptación:**
- CA1: El administrador registra un ingreso indicando el insumo y la cantidad en la unidad de medida del insumo.
- CA2: El stock del insumo aumenta de inmediato en la cantidad ingresada.
- CA3: El ingreso queda registrado como un movimiento con fecha, cantidad y usuario.
- CA4: Si tras el ingreso el stock supera el mínimo, la alerta de ese insumo deja de mostrarse.
- CA5: Una persona sin experiencia técnica puede registrar un ingreso sin ayuda externa en su primer intento.

## HU-06
Como administrador, quiero registrar los insumos y la receta de cada producto, para que el sistema pueda calcular el descuento de cada pedido.
**Actividad TO-BE asociada:** Registrar insumos y recetas (prov.)
**Criterios de aceptación:**
- CA1: El administrador registra un insumo con su nombre, unidad de medida y stock mínimo.
- CA2: El administrador define y modifica la receta de un producto indicando sus insumos y las cantidades de cada uno.
- CA3: Un insumo que forma parte de alguna receta no se puede eliminar, solo desactivar.
- CA4: Un cambio en una receta afecta solo a los pedidos posteriores y no modifica descuentos ya registrados.
