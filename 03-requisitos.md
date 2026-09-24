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
El dueño también pidió comandas y cuadratura de caja, que quedan fuera de alcance; las ventas y la ganancia sí se incluyeron, a diferencia de lo definido antes (ver Alcance en README.md).
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
| RP-09 | El sistema debe permitir el acceso al módulo de inventario únicamente a usuarios con rol de administrador. | Funcional (política de acceso) | Revisar inventario, ventas y decidir reposición (prov.); Reabastecer stock (prov.); Registrar insumos y recetas (prov.) |
| RP-10 | El sistema debe mantener una disponibilidad de al menos 99,9 % durante el horario de atención del local. | No funcional (Restricción de calidad de servicio — fiabilidad) | Descontar insumos y registrar venta (prov.) |
| RP-11 | El sistema debe responder en 1 segundo o menos en al menos el 95 % de las operaciones de descuento y de consulta de stock. | No funcional (Restricción de calidad de servicio — tiempo de respuesta) | Descontar insumos y registrar venta (prov.); Revisar inventario, ventas y decidir reposición (prov.) |
| RP-12 | La interfaz debe ser simple para un administrador sin experiencia técnica: debe poder registrar una reposición y una receta sin ayuda externa. | No funcional (Capacidad de interacción) *(no calza claramente en las dos categorías vistas en clase; confirmar con el profesor)* | Reabastecer stock (prov.); Registrar insumos y recetas (prov.) |
| RP-13 | La aplicación debe funcionar sin errores en la versión vigente de Safari, en computador de escritorio, para consultar el stock y registrar una reposición. | No funcional (Restricción de tecnología — navegador/plataforma) | Revisar inventario, ventas y decidir reposición (prov.); Reabastecer stock (prov.) |

## Requisitos de proyecto
| ID | Requisito |
|----|-----------|
| RY-01 (Costo) | El sistema debe poder implementarse y operarse sin costos de licenciamiento relevantes para el dueño, dado que Brookies Coffee es una cafetería familiar de un solo local que aún no genera ingresos por venta. *(Supuesto: el dueño no definió un presupuesto; falta confirmarlo.)* |
| RY-02 (Plazo) | El sistema debe estar operativo antes de que el local abra comercialmente al público, ya que hoy el control de insumos es completamente manual y ese es el problema que el dueño busca resolver antes de partir. *(Supuesto: el dueño no dio una fecha exacta de apertura; falta confirmarla.)* |
| RY-03 (Dotación) | Brookies Coffee no cuenta con personal técnico (TI); el sistema debe quedar simple de mantener y operar por el propio dueño y su personal (administrador, barista, personal de caja), sin soporte técnico dedicado después de la entrega. |
| RY-04 (Entorno de pruebas) | Como el local aún no opera comercialmente, el sistema debe poder probarse con datos ficticios o con los insumos y recetas ya relevados (ver 05-elicitacion.md), sin depender de un entorno de producción real. |
| RY-05 (Migración de datos) | Los insumos y las recetas están hoy en un cuaderno físico (8 recetas relevadas: 4 masas y 4 bebidas); el sistema debe permitir cargar esa información inicial antes de empezar a operar. |
| RY-06 (Capacitación) | El administrador, el barista y el personal de caja no tienen experiencia técnica previa con sistemas de este tipo (ver RP-12); el sistema debe poder aprenderse a usar sin necesitar capacitación formal extensa. |

## Requisito derivado
**Requisito origen:** RP-01 — El sistema debe descontar automáticamente del inventario los insumos de cada producto de un pedido confirmado, según la receta del producto.
**Requisito derivado:** RP-07 — El sistema debe permitir al administrador definir y modificar la receta de cada producto (insumos y cantidades).
**Justificación:** El descuento automático (RP-01) solo puede calcularse si el sistema conoce qué insumos y en qué cantidad lleva cada producto. El requisito origen no lo dice, pero lo necesita para funcionar: de ahí se deriva la necesidad de registrar y mantener las recetas.
