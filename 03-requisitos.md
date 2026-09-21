# Clasificación de requisitos

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: los nombres de actividad marcados con (prov.) son provisorios. Deben reemplazarse por los nombres exactos de la tabla "Actividades que cambian" de 02-rediseno-to-be.md, y luego quitar la marca (prov.).
Alcance: solo gestión de inventario y descuento de insumos por pedido. El pedido confirmado es el evento que dispara el proceso; su toma y el pago se desarrollan en otro ramo.
Actividades TO-BE provisorias usadas:
  - Descontar insumos según receta (prov.)
  - Alertar stock crítico (prov.)
  - Revisar inventario y decidir reposición (prov.)
  - Reabastecer stock (prov.)
  - Registrar insumos y recetas (prov.)
Fuera de alcance por pertenecer al otro ramo (pedido, pago, cuentas): registro de clientes, sesión, menú, carrito, pago en línea, historial y estado de pedidos, cifrado de contraseñas, accesibilidad de la tienda.
Opcional si el equipo quiere ampliar: validar stock antes de aceptar un pedido (RF07 del documento de definición).
Decisión pendiente: cómo llega el pedido al módulo (lo recibe de la aplicación web o lo registra el administrador).
Entrevista: el dueño indicó que hay barista y personal de caja (contradice el supuesto de que no hay empleados aparte del dueño). Decidir si algún requisito o historia involucra a esos roles.
El dueño también pidió ventas, comandas, ganancias y cuadratura de caja: fuera de alcance (ver RY-05).
Recetas (revisión documental): las cantidades son por tanda y no indican cuántas unidades rinde cada masa; los productos comparten una masa base con ingredientes agregados; la vainilla está en cucharaditas. Si el dueño lo confirma, revisar RP-06 (unidad de medida por insumo) y RP-07 (receta con rendimiento y base compartida). -->

## Requisitos de producto
| ID | Requisito | Tipo (funcional/no funcional) | Actividad TO-BE asociada |
|----|-----------|--------------------------------|----------------------------|
| RP-01 | El sistema debe descontar automáticamente del inventario los insumos de cada producto de un pedido confirmado, según la receta del producto. | Funcional | Descontar insumos según receta (prov.) |
| RP-02 | El sistema debe generar una alerta al administrador cuando el stock de un insumo alcance el nivel mínimo que él definió. | Funcional | Alertar stock crítico (prov.) |
| RP-03 | El sistema debe permitir al administrador consultar en tiempo real el stock actual de cada insumo junto a su nivel mínimo. | Funcional | Revisar inventario y decidir reposición (prov.) |
| RP-04 | El sistema debe entregar al administrador un informe al cierre del día con el stock inicial, el stock final y el consumo de cada insumo, y permitir consultar el consumo por período (día, semana, mes) para anticipar el reabastecimiento. | Funcional | Revisar inventario y decidir reposición (prov.) |
| RP-05 | El sistema debe permitir al administrador registrar el ingreso de stock de un insumo cuando lo repone. | Funcional | Reabastecer stock (prov.) |
| RP-06 | El sistema debe permitir al administrador registrar, editar y desactivar insumos, con su unidad de medida y su stock mínimo. | Funcional | Registrar insumos y recetas (prov.) |
| RP-07 (derivado de RP-01) | El sistema debe permitir al administrador definir y modificar la receta de cada producto (insumos y cantidades). | Funcional | Registrar insumos y recetas (prov.) |
| RP-08 | El sistema debe registrar cada movimiento de inventario (descuento por pedido, reposición) con su fecha, cantidad y el pedido o usuario asociado, para dar trazabilidad entre ventas y consumo de insumos. | Funcional | Descontar insumos según receta (prov.); Reabastecer stock (prov.) |
| RP-09 | El sistema debe restringir el acceso al módulo de inventario a usuarios con rol de administrador. | No funcional (Seguridad) | Revisar inventario y decidir reposición (prov.); Reabastecer stock (prov.); Registrar insumos y recetas (prov.) |
| RP-10 | El sistema debe mantener una disponibilidad de al menos 99,9 % durante el horario de atención del local. | No funcional (Fiabilidad) | Descontar insumos según receta (prov.) |
| RP-11 | El sistema debe responder en 1 segundo o menos en al menos el 95 % de las operaciones de descuento y de consulta de stock. | No funcional (Eficiencia de desempeño) | Descontar insumos según receta (prov.); Revisar inventario y decidir reposición (prov.) |
| RP-12 | La interfaz debe ser simple para un administrador sin experiencia técnica: debe poder registrar una reposición y una receta sin ayuda externa. | No funcional (Capacidad de interacción) | Reabastecer stock (prov.); Registrar insumos y recetas (prov.) |
| RP-13 | La aplicación debe funcionar sin errores en la versión vigente de Safari, en computador de escritorio, para consultar el stock y registrar una reposición. | No funcional (Compatibilidad) | Revisar inventario y decidir reposición (prov.); Reabastecer stock (prov.) |

## Requisitos de proyecto
| ID | Requisito |
|----|-----------|
| RY-01 | La documentación de la Entrega 1 debe estar publicada en un repositorio de una organización de GitHub del equipo, con un archivo .md por elemento enlazado desde `IngReq-Entrega 1.md`, hasta el jueves 24 de septiembre a las 10:00. |
| RY-02 | Los procesos AS-IS y TO-BE deben modelarse en BPMN 2.0 (Camunda Modeler o bpmn.io/draw.io), distinguiendo tareas de usuario, de servicio y manuales, y adjuntando el PNG y el archivo .bpmn. |
| RY-03 | La elicitación debe documentar al menos dos técnicas, cada una con evidencia gráfica de la sesión. |
| RY-04 | Cada integrante del equipo debe tener a su cargo al menos un documento de la entrega, declarado por escrito en el repositorio. |
| RY-05 | El alcance de este proyecto se limita a la gestión de inventario de insumos y al descuento por pedido en un solo local; la toma de pedidos, el pago en línea y las cuentas de clientes quedan fuera. |

## Requisito derivado
**Requisito origen:** RP-01 — El sistema debe descontar automáticamente del inventario los insumos de cada producto de un pedido confirmado, según la receta del producto.
**Requisito derivado:** RP-07 — El sistema debe permitir al administrador definir y modificar la receta de cada producto (insumos y cantidades).
**Justificación:** El descuento automático (RP-01) solo puede calcularse si el sistema conoce qué insumos y en qué cantidad lleva cada producto. El requisito origen no lo dice, pero lo necesita para funcionar: de ahí se deriva la necesidad de registrar y mantener las recetas.
