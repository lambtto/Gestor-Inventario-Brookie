# Trazabilidad

Una fila por cada requisito de producto (RP-xx) de [03-requisitos.md](./03-requisitos.md) de la Entrega 1. Los requisitos de proyecto (RY-xx) no se incluyen: no son comportamiento del sistema, no tienen historia, caso de uso ni diagrama asociado. Las 6 historias de [04-historias-usuario.md](./04-historias-usuario.md) aparecen todas en la matriz, algunas en más de una fila porque más de un requisito las usa.

## Matriz de trazabilidad

| Requisito (Entrega 1) | Historia | Caso de uso | Secuencia | Estado | Clases del dominio |
|---|---|---|---|---|---|
| RP-01 | [HU-01](./04-historias-usuario.md#hu-01--registrar-venta) | [CU-01](./09-casos-de-uso.md) | [DSS-01](./10-diagramas-secuencia.md), [DSS-02](./10-diagramas-secuencia.md) | [EST-01](./11-diagramas-estado.md) | Pedido, Venta, Producto, Receta, Ingrediente, Insumo, Descuento |
| RP-02 | [HU-01](./04-historias-usuario.md#hu-01--registrar-venta), [HU-02](./04-historias-usuario.md#hu-02--alertar-stock-crítico) | [CU-01](./09-casos-de-uso.md), [CU-02](./09-casos-de-uso.md) | [DSS-02](./10-diagramas-secuencia.md) | [EST-01](./11-diagramas-estado.md), [EST-02](./11-diagramas-estado.md) | Insumo, AlertaDeStock |
| RP-03 | [HU-03](./04-historias-usuario.md#hu-03--consultar-stock) | [CU-03](./09-casos-de-uso.md) | — | — | Insumo |
| RP-04 | [HU-04](./04-historias-usuario.md#hu-04--consultar-informe) | [CU-04](./09-casos-de-uso.md) | — | — | Insumo, MovimientoDeInventario, Descuento, Reposición, Pedido, Venta, Producto |
| RP-05 | [HU-05](./04-historias-usuario.md#hu-05--registrar-ingreso-de-stock) | [CU-05](./09-casos-de-uso.md) | [DSS-03](./10-diagramas-secuencia.md) | [EST-01](./11-diagramas-estado.md), [EST-02](./11-diagramas-estado.md) | Insumo, Reposición, AlertaDeStock |
| RP-06 | [HU-06](./04-historias-usuario.md#hu-06--registrar-insumos-y-recetas) | [CU-06](./09-casos-de-uso.md), [CU-08](./09-casos-de-uso.md) | [DSS-04](./10-diagramas-secuencia.md), [DSS-05](./10-diagramas-secuencia.md) | [EST-01](./11-diagramas-estado.md) | Insumo |
| RP-07 (derivado de RP-01) | [HU-06](./04-historias-usuario.md#hu-06--registrar-insumos-y-recetas) | [CU-07](./09-casos-de-uso.md) | — | — | Receta, Ingrediente, Producto, Insumo |
| RP-08 | [HU-01](./04-historias-usuario.md#hu-01--registrar-venta), [HU-05](./04-historias-usuario.md#hu-05--registrar-ingreso-de-stock) | [CU-01](./09-casos-de-uso.md), [CU-05](./09-casos-de-uso.md) | [DSS-01](./10-diagramas-secuencia.md), [DSS-03](./10-diagramas-secuencia.md) | — | MovimientoDeInventario, Descuento, Reposición, Insumo, Pedido |
| RP-09 | [HU-02](./04-historias-usuario.md#hu-02--alertar-stock-crítico), [HU-03](./04-historias-usuario.md#hu-03--consultar-stock), [HU-04](./04-historias-usuario.md#hu-04--consultar-informe), [HU-05](./04-historias-usuario.md#hu-05--registrar-ingreso-de-stock), [HU-06](./04-historias-usuario.md#hu-06--registrar-insumos-y-recetas) | [CU-02](./09-casos-de-uso.md), [CU-03](./09-casos-de-uso.md), [CU-04](./09-casos-de-uso.md), [CU-05](./09-casos-de-uso.md), [CU-06](./09-casos-de-uso.md), [CU-07](./09-casos-de-uso.md), [CU-08](./09-casos-de-uso.md) | — | — | — |
| RP-10 | [HU-01](./04-historias-usuario.md#hu-01--registrar-venta) | [CU-01](./09-casos-de-uso.md) | [DSS-01](./10-diagramas-secuencia.md) | — | — |
| RP-11 | [HU-01](./04-historias-usuario.md#hu-01--registrar-venta), [HU-03](./04-historias-usuario.md#hu-03--consultar-stock) | [CU-01](./09-casos-de-uso.md), [CU-03](./09-casos-de-uso.md) | [DSS-01](./10-diagramas-secuencia.md) | — | — |
| RP-12 | [HU-05](./04-historias-usuario.md#hu-05--registrar-ingreso-de-stock), [HU-06](./04-historias-usuario.md#hu-06--registrar-insumos-y-recetas) | [CU-05](./09-casos-de-uso.md), [CU-06](./09-casos-de-uso.md), [CU-07](./09-casos-de-uso.md), [CU-08](./09-casos-de-uso.md) | — | — | — |
| RP-13 | [HU-03](./04-historias-usuario.md#hu-03--consultar-stock), [HU-05](./04-historias-usuario.md#hu-05--registrar-ingreso-de-stock) | [CU-03](./09-casos-de-uso.md), [CU-05](./09-casos-de-uso.md) | — | — | — |

## Observaciones

- **RP-03, RP-04 y RP-07 no tienen diagrama de secuencia ni de estado.** Son consultas (stock, informe) o un registro simple (definir receta) que no integran con ningún sistema externo y que no hacen cambiar de estado a ninguna clase del dominio. Los diagramas de secuencia se priorizaron en la integración con el sistema de toma de pedidos (DSS-01, DSS-02) y en las acciones del administrador que mueven el stock o los insumos (DSS-03 a DSS-05).
- **RP-08 no tiene diagrama de estado propio.** La trazabilidad de movimientos es un registro histórico (`Descuento` y `Reposición` no cambian de estado una vez creados); sus eventos disparadores aparecen en EST-01.
- **RP-06 menciona "editar" insumos**, pero la edición no está especificada como caso de uso en esta entrega; las acciones de registrar y dar de baja sí (CU-06, CU-08).
- **RP-09 no tiene clase del dominio**: el administrador es un rol, no un concepto del negocio (ver decisiones de modelado en [08-modelo-dominio.md](./08-modelo-dominio.md)).
- **RP-10, RP-11, RP-12 y RP-13 son requisitos no funcionales** (calidad de servicio y tecnología, ver 03-requisitos.md). No describen un comportamiento sino una condición que ese comportamiento debe cumplir; por eso no tienen clases, secuencia ni estado propios, y se asocian a la historia y al caso de uso que restringen.
- **Ningún RY-xx (requisito de proyecto) aparece en esta matriz**: costo, plazo, dotación, entorno de pruebas, migración de datos y capacitación son condiciones del proyecto, no del sistema.
- **RP-02 incluye CU-01 y DSS-02 cubre HU-01 y HU-02**: la alerta se genera cuando el sistema procesa un pedido (CU-01, HU-01) y el administrador la consulta después (CU-02, HU-02). Por eso DSS-02 se asocia a ambos casos de uso y a ambas historias.
- **Insumo recién registrado (supuesto)**: HU-06 no pide un stock inicial, así que se asumió que el insumo nace con stock 0 y, por lo tanto, en "Stock crítico" y con su alerta generada (EST-01, EST-02 y DSS-04). Si el equipo prefiere cargar el stock al registrar, hay que cambiar esas tres piezas.
- **Alerta de un insumo desactivado o eliminado**: si se desactiva, la alerta queda resuelta (EST-02, DSS-05); solo se puede eliminar un insumo sin recetas ni movimientos, y en ese caso sus alertas se eliminan con él. Las historias no lo dicen de forma explícita; es una decisión de modelado para que ninguna alerta quede vigente sobre un insumo que ya no se usa.
