# Proceso de negocio — AS-IS

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: supuestos por validar con el dueño y el profesor:
1) Quién registra las ventas y la rebaja de insumos en Excel al cerrar el día (se asignó al administrador) y quién cuadra la caja (personal de caja).
2) Los objetivos del barista y del personal de caja son razonables, pero el dueño no los dijo textualmente.
3) El camino "falta un insumo" (el barista avisa al administrador) se apoya en que el dueño compra "cada vez que falte"; confirmar cómo se avisa.
4) El AS-IS no tiene tareas de servicio porque no hay un sistema que ejecute pasos de forma automática. Confirmar con el profesor que es aceptable.
5) Abrir diagramas/as-is.bpmn en bpmn.io, revisar que se vea bien, y volver a descargar el .bpmn y el PNG desde la herramienta. -->

## Macro-proceso y proceso específico
Operación de la cafetería → Control y reabastecimiento de inventario de insumos (sin el gestor)

Brookies Coffee aún no opera comercialmente: el AS-IS se construyó proyectando cómo funcionaría el control manual de insumos con la información que sí existe hoy — cómo el dueño compra insumos y prueba recetas, más lo que él mismo describió en la entrevista del 21/09/2026 sobre cómo planea operar (ver [Elicitación](./05-elicitacion.md)). El flujo del pedido se incluye solo para mostrar dónde se consumen los insumos; el detalle de la venta (toma de pedidos, pago en línea) queda fuera del alcance.

## Objetivo de negocio del proceso
Contar con los insumos necesarios para preparar los productos cuando se pidan, evitando quiebres de stock, pérdidas y compras de urgencia, y conociendo cuánto stock queda de cada insumo para decidir cuándo reponer.

## Participantes y sus objetivos
| Participante | Objetivo en el proceso |
|---------------|------------------------|
| Administrador (dueño) | Saber qué insumos faltarán y comprarlos a tiempo y al mejor precio, y ver cómo va el negocio en tiempo real. |
| Barista | Preparar cada pedido con la receta y sin quedarse sin insumos. |
| Personal de caja | Registrar y cobrar los pedidos y cuadrar la caja al cierre del día. |
| Proveedor o tienda (externo) | Vender al administrador los insumos que necesita. |

## Diagrama AS-IS
![Proceso AS-IS](./diagramas/as-is.png)
Archivo fuente: [`./diagramas/as-is.bpmn`](./diagramas/as-is.bpmn)
Las tareas manuales llevan el ícono de mano y las tareas de usuario el ícono de persona (trabajo con apoyo de una planilla Excel). No hay tareas de servicio porque el proceso actual no tiene ningún sistema que ejecute pasos de forma automática.

## Actividades del diagrama
| ID | Actividad | Carril | Tipo de tarea |
|----|-----------|--------|---------------|
| A01 | Anotar la comanda a mano | Personal de caja | Manual |
| A02 | Preparar el pedido con la receta | Barista | Manual |
| A03 | Avisar que falta un insumo | Barista | Manual |
| A04 | Entregar y cobrar el pedido | Personal de caja | Manual |
| A05 | Cuadrar la caja | Personal de caja | Manual |
| A06 | Registrar ventas y rebaja de insumos en Excel | Administrador (dueño) | Usuario |
| A07 | Contar el inventario a mano | Administrador (dueño) | Manual |
| A08 | Anotar el conteo en planilla Excel | Administrador (dueño) | Usuario |
| A09 | Estimar al ojo cuánto comprar | Administrador (dueño) | Manual |
| A10 | Buscar dónde comprar más barato | Administrador (dueño) | Manual |
| A11 | Comprar los insumos | Administrador (dueño) | Manual |
| A12 | Guardar los insumos | Administrador (dueño) | Manual |

## Problemas identificados
- Hay quiebres de stock por falta de insumos (A02, A03), lo que afecta el objetivo del administrador de comprar a tiempo y el del barista de no quedarse sin insumos.
- El inventario se cuenta a mano una vez por semana (A07): el stock real se conoce con atraso y solo al cerrar el día el dueño sabe qué faltará para el siguiente. Afecta el objetivo del administrador de saber qué insumos faltarán.
- La rebaja de insumos no se descuenta con cada pedido: se registra a mano en planillas Excel al cerrar el día (A06). Afecta el objetivo del administrador de ver el negocio en tiempo real.
- La cantidad a comprar se estima "al ojo" y, cuando hay ofertas, se compra bastante (A09, A10), lo que dificulta comprar lo justo y a tiempo. Afecta el objetivo del administrador.
- Las recetas están en un cuaderno escrito a mano, por tanda y sin indicar cuántas unidades rinde cada masa (A02), por lo que no se puede calcular cuánto insumo se consume por cada producto vendido. Afecta los objetivos del administrador y del barista.
