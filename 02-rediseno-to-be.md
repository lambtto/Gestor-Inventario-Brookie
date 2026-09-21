# Análisis de rediseño y propuesta TO-BE

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR completo para revisar y rediseñar en equipo. Al cerrarlo: quitar la marca (prov.) aquí, en 03 y en 04; abrir diagramas/to-be.bpmn en bpmn.io, ajustar y volver a descargar el .bpmn y el PNG desde la herramienta.
Decisiones pendientes que afectan este documento:
1) RESUELTO: el gestor de inventario solo recibe el pedido ya confirmado, con sus productos, cantidades y el monto de la venta; no participa en tomar el pedido, el menú, el carrito ni el pago (eso es del otro ramo). Con esos datos, el gestor descuenta los insumos según receta y registra la venta, para poder informar qué se vendió, cuánto y la ganancia del día. Queda como contrato pendiente con el otro equipo: que el evento "Pedido confirmado" incluya el monto de la venta.
2) Si el barista o el personal de caja usan el gestor. Hoy solo lo usa el administrador; sus tareas (A01, A02, A04, A05) no cambian.
3) Si se mantiene un conteo físico ocasional para verificar el stock del sistema (mitiga el riesgo de la Iniciativa 3).
4) Rendimiento de las recetas (unidades por tanda): sin ese dato el descuento por unidad no es calculable (ver 05-elicitacion.md).
Heurísticas: catálogo de Reijers y Mansar (2005), "Best practices in business process redesign". -->

## Mejoras identificadas por participante
| Participante | Objetivo | Problema | Mejora deseada |
|----------------|----------|----------|-----------------|
| Administrador (dueño) | Saber qué insumos faltarán y comprarlos a tiempo | Hay quiebres de stock y el stock real se conoce con atraso (conteo semanal a mano) | Recibir una alerta cuando un insumo llega al mínimo y consultar el stock en tiempo real |
| Administrador (dueño) | Ver cómo va el negocio en tiempo real | La rebaja de insumos se anota a mano en Excel al cerrar el día | Que el sistema descuente los insumos con cada pedido y entregue un informe al cierre del día |
| Administrador (dueño) | Saber qué se vendió y cuánto ganó, sin calcularlo a mano | Las ventas y ganancias se llevan en Excel, junto con la rebaja de insumos | Que el sistema registre cada venta al confirmarse el pedido y calcule la ganancia del día |
| Administrador (dueño) | Comprar lo justo y a tiempo | La cantidad a comprar se estima "al ojo" y las recetas están en un cuaderno, por tanda y sin rendimiento | Contar con el consumo por período y con las recetas registradas en el sistema |
| Barista | Preparar los pedidos sin quedarse sin insumos | Puede faltar un insumo al preparar y debe avisar al dueño | Que el dueño reponga a tiempo gracias a las alertas (mejora indirecta) |
| Personal de caja | Registrar y cobrar los pedidos y cuadrar la caja | Sin problemas asociados al inventario | Ninguna en este alcance: sus tareas no cambian |

## Iniciativas de rediseño
### Iniciativa 1: Automatizar el descuento de insumos y el registro de venta
- Actividad(es) del AS-IS que afecta: A06 (Registrar ventas y rebaja de insumos en Excel), del administrador.
- Heurística aplicada: Task automation (automatizar tareas).
- Objetivo o mejora que resuelve: el objetivo del administrador de ver el negocio en tiempo real, no anotar la rebaja a mano, y saber qué vendió y cuánto ganó sin calcularlo aparte.
- Efecto esperado (tiempo/costo/calidad/flexibilidad): tiempo y costo bajan, porque desaparece la anotación diaria de insumos y de ventas; la calidad sube, porque se evitan errores de anotación y el descuento y el registro de la venta quedan siempre juntos y consistentes. Como contrapeso, desarrollar el sistema tiene un costo y un sistema es menos flexible que una persona ante variaciones, por ejemplo las recetas que cambian por temporada.

### Iniciativa 2: Alertar automáticamente cuando el stock llega al mínimo
- Actividad(es) del AS-IS que afecta: A03 (Avisar que falta un insumo), del barista, y la decisión de compra del administrador.
- Heurística aplicada: Control addition (agregar controles).
- Objetivo o mejora que resuelve: el objetivo del administrador de comprar a tiempo y el del barista de no quedarse sin insumos.
- Efecto esperado (tiempo/costo/calidad/flexibilidad): la calidad sube, porque hay menos quiebres y menos compras de urgencia. Un control normalmente agrega tiempo, pero aquí lo ejecuta el sistema, así que el costo adicional es bajo.

### Iniciativa 3: Eliminar el conteo semanal a mano y la estimación al ojo
- Actividad(es) del AS-IS que afecta: A07 (Contar el inventario a mano), A08 (Anotar el conteo en planilla Excel) y A09 (Estimar al ojo cuánto comprar), del administrador.
- Heurística aplicada: Task elimination (eliminar tareas innecesarias).
- Objetivo o mejora que resuelve: el objetivo del administrador de saber qué insumos faltarán sin gastar tiempo cada semana en contar y anotar.
- Efecto esperado (tiempo/costo/calidad/flexibilidad): tiempo y costo bajan, porque desaparecen tres tareas semanales. El riesgo, señalado por la heurística, es que la calidad empeore; se mitiga con el registro de cada movimiento de inventario y con la consulta del stock en tiempo real.

### Iniciativa 4: Centralizar stock, recetas e ingresos en un gestor de inventario
- Actividad(es) del AS-IS que afecta: A12 (Guardar los insumos, ahora con registro del ingreso), el uso de la receta en el cuaderno (A02) y la actividad nueva de registrar insumos y recetas.
- Heurística aplicada: Integral technology (aplicar tecnología que elimine restricciones físicas).
- Objetivo o mejora que resuelve: el objetivo del administrador de tener el stock y las recetas en un solo lugar, actualizados y disponibles cuando los necesita.
- Efecto esperado (tiempo/costo/calidad/flexibilidad): baja el tiempo en tareas logísticas y sube la calidad, porque la información es única y actual. Como contrapeso hay costos de desarrollo y capacitación y un posible rechazo de las personas ante la tecnología nueva: el dueño dijo que lo peor sería que el sistema sea difícil de usar.

## Diagrama TO-BE
![Proceso TO-BE](./diagramas/to-be.png)
Archivo fuente: [`./diagramas/to-be.bpmn`](./diagramas/to-be.bpmn)
Las tareas de servicio (ícono de engranaje) las ejecuta el gestor de inventario sin intervención de una persona; las tareas de usuario (ícono de persona) las hace el administrador con apoyo del gestor; las manuales (ícono de mano) no tienen apoyo de ningún sistema. El evento "Pedido confirmado" representa el pedido que llega al gestor desde el otro sistema, ya con sus productos, cantidades y el monto de la venta; el gestor no participa en tomar el pedido, solo lo recibe confirmado.

## Actividades que cambian del AS-IS al TO-BE
| Actividad en el AS-IS | Actividad en el TO-BE | Qué cambia |
|-------------------------|--------------------------|------------|
| A06 — Registrar ventas y rebaja de insumos en Excel (tarea de usuario, al cerrar el día) | N01 — Descontar insumos y registrar venta (prov.) (tarea de servicio) | La rebaja de insumos y el registro de la venta dejan de anotarse a mano al cierre: el sistema los calcula solos con la receta y el monto de cada pedido confirmado. |
| A03 — Avisar que falta un insumo (tarea manual, cuando ya faltó) | N02 — Alertar stock crítico (prov.) (tarea de servicio) | En vez de enterarse cuando el insumo ya faltó, el administrador recibe una alerta cuando el stock llega al mínimo que definió. |
| A07 — Contar el inventario a mano; A08 — Anotar el conteo en planilla Excel; A09 — Estimar al ojo cuánto comprar (manual y de usuario, una vez por semana) | N03 — Revisar inventario, ventas y decidir reposición (prov.) (tarea de usuario) | El stock se consulta en tiempo real y el informe de cierre entrega stock inicial, final, consumo por insumo, qué se vendió y la ganancia del día, así que ya no se cuenta a mano cada semana ni se estima al ojo. |
| A12 — Guardar los insumos (tarea manual) | N04 — Reabastecer stock (prov.) (tarea de usuario) | Además de guardar los insumos, el administrador registra el ingreso en el sistema y el stock se actualiza al instante. |
| (no existe: las recetas están en un cuaderno a mano y se usan en A02 — Preparar el pedido con la receta) | N05 — Registrar insumos y recetas (prov.) (tarea de usuario) | Actividad nueva: se registran los insumos y la receta de cada producto en el sistema, que es lo que permite el descuento automático. |

No cambian A01 (anotar la comanda), A02 (preparar el pedido con la receta), A04 (entregar y cobrar), A05 (cuadrar la caja), A10 (buscar dónde comprar más barato) ni A11 (comprar los insumos), que siguen siendo manuales.

Esta tabla es la que usarán en 03-requisitos.md y 04-historias-usuario.md para asociar cada requisito e historia a la actividad que cambia.
