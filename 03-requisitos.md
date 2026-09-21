# Clasificación de requisitos

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: los nombres de actividad marcados con (prov.) son provisorios. Deben reemplazarse por los nombres exactos de la tabla "Actividades que cambian" de 02-rediseno-to-be.md, y luego quitar la marca (prov.).
Alcance: solo gestión de inventario y descuento de insumos por pedido. El pedido confirmado es el evento que dispara el proceso; su toma y el pago se desarrollan en otro ramo.
Actividades TO-BE provisorias usadas:
  - Descontar insumos y registrar venta (prov.)
  - Alertar stock crítico (prov.)
  - Revisar inventario, ventas y decidir reposición (prov.)
  - Reabastecer stock (prov.)
  - Registrar insumos y recetas (prov.)
Fuera de alcance por pertenecer al otro ramo (pedido, pago, cuentas): registro de clientes, sesión, menú, carrito, pago en línea, historial y estado de pedidos, cifrado de contraseñas, accesibilidad de la tienda.
Opcional si el equipo quiere ampliar: validar stock antes de aceptar un pedido (RF07 del documento de definición).
RESUELTO: el módulo recibe el pedido ya confirmado desde el otro sistema, con productos, cantidades y el monto de la venta; no toma el pedido ni procesa el pago. Con eso, además de descontar insumos, registra la venta y calcula la ganancia del día (ver 02-rediseno-to-be.md).
Entrevista: el dueño indicó que hay barista y personal de caja (contradice el supuesto de que no hay empleados aparte del dueño). Decidir si algún requisito o historia involucra a esos roles.
El dueño también pidió comandas y cuadratura de caja, que quedan fuera de alcance; las ventas y la ganancia sí se incluyeron, a diferencia de lo definido antes (ver RY-05).
Recetas (revisión documental): confirmado con el dueño que cada receta de masa rinde 10 galletas (ver 05-elicitacion.md); los productos comparten una masa base con ingredientes agregados; la vainilla está en cucharaditas. -->

## Requisitos de producto
| ID | Requisito | Tipo (funcional/no funcional) | Actividad TO-BE asociada |
|----|-----------|--------------------------------|----------------------------|
| RP-01 | El sistema debe descontar automáticamente del inventario los insumos de cada producto de un pedido confirmado, según la receta del producto, y registrar la venta (producto, cantidad y monto). | Funcional | Descontar insumos y registrar venta (prov.) |
| RP-02 | El sistema debe generar una alerta al administrador cuando el stock de un insumo alcance el nivel mínimo que él definió. | Funcional | Alertar stock crítico (prov.) |
| RP-03 | El sistema debe permitir al administrador consultar en tiempo real el stock actual de cada insumo junto a su nivel mínimo. | Funcional | Revisar inventario, ventas y decidir reposición (prov.) |
| RP-04 | El sistema debe entregar al administrador un informe al cierre del día con el stock inicial, el stock final y el consumo de cada insumo, más qué se vendió, cuánto se vendió y la ganancia del día, y permitir consultar por período (día, semana, mes) para anticipar el reabastecimiento. | Funcional | Revisar inventario, ventas y decidir reposición (prov.) |
| RP-05 | El sistema debe permitir al administrador registrar el ingreso de stock de un insumo cuando lo repone. | Funcional | Reabastecer stock (prov.) |
| RP-06 | El sistema debe permitir al administrador registrar, editar y desactivar insumos, con su unidad de medida, su costo unitario y su stock mínimo. | Funcional | Registrar insumos y recetas (prov.) |
| RP-07 (derivado de RP-01) | El sistema debe permitir al administrador definir y modificar la receta de cada producto (insumos y cantidades). | Funcional | Registrar insumos y recetas (prov.) |
| RP-08 | El sistema debe registrar cada movimiento de inventario (descuento por pedido, reposición) con su fecha, cantidad y el pedido o usuario asociado, para dar trazabilidad entre ventas y consumo de insumos. | Funcional | Descontar insumos y registrar venta (prov.); Reabastecer stock (prov.) |
| RP-09 | El sistema debe restringir el acceso al módulo de inventario a usuarios con rol de administrador. | No funcional (Seguridad) | Revisar inventario, ventas y decidir reposición (prov.); Reabastecer stock (prov.); Registrar insumos y recetas (prov.) |
| RP-10 | El sistema debe mantener una disponibilidad de al menos 99,9 % durante el horario de atención del local. | No funcional (Fiabilidad) | Descontar insumos y registrar venta (prov.) |
| RP-11 | El sistema debe responder en 1 segundo o menos en al menos el 95 % de las operaciones de descuento y de consulta de stock. | No funcional (Eficiencia de desempeño) | Descontar insumos y registrar venta (prov.); Revisar inventario, ventas y decidir reposición (prov.) |
| RP-12 | La interfaz debe ser simple para un administrador sin experiencia técnica: debe poder registrar una reposición y una receta sin ayuda externa. | No funcional (Capacidad de interacción) | Reabastecer stock (prov.); Registrar insumos y recetas (prov.) |
| RP-13 | La aplicación debe funcionar sin errores en la versión vigente de Safari, en computador de escritorio, para consultar el stock y registrar una reposición. | No funcional (Compatibilidad) | Revisar inventario, ventas y decidir reposición (prov.); Reabastecer stock (prov.) |

## Requisitos de proyecto
| ID | Requisito |
|----|-----------|
| RY-01 | La documentación de la Entrega 1 debe estar publicada en un repositorio de una organización de GitHub del equipo, con un archivo .md por elemento enlazado desde `IngReq-Entrega 1.md`, hasta el jueves 24 de septiembre a las 10:00. |
| RY-02 | Los procesos AS-IS y TO-BE deben modelarse en BPMN 2.0 (Camunda Modeler o bpmn.io/draw.io), distinguiendo tareas de usuario, de servicio y manuales, y adjuntando el PNG y el archivo .bpmn. |
| RY-03 | La elicitación debe documentar al menos dos técnicas, cada una con evidencia gráfica de la sesión. |
| RY-04 | Cada integrante del equipo debe tener a su cargo al menos un documento de la entrega, declarado por escrito en el repositorio. |
| RY-05 | El alcance de este proyecto se limita a la gestión de inventario de insumos, el descuento por pedido y el registro de ventas y ganancia, en un solo local; la toma de pedidos (menú, carrito), el pago en línea, las cuentas de clientes y las comandas quedan fuera. |

## Requisito derivado
**Requisito origen:** RP-01 — El sistema debe descontar automáticamente del inventario los insumos de cada producto de un pedido confirmado, según la receta del producto.
**Requisito derivado:** RP-07 — El sistema debe permitir al administrador definir y modificar la receta de cada producto (insumos y cantidades).
**Justificación:** El descuento automático (RP-01) solo puede calcularse si el sistema conoce qué insumos y en qué cantidad lleva cada producto. El requisito origen no lo dice, pero lo necesita para funcionar: de ahí se deriva la necesidad de registrar y mantener las recetas.
