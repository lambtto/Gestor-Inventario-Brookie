# Brookies Coffee — Gestor de inventario de insumos

Documentación de requisitos del proyecto de la cafetería **Brookies Coffee**, desarrollada para el ramo **CIN 324 Ingeniería de Requisitos** (Universidad de Valparaíso). Este repositorio corresponde a la **Entrega 1**.

## ¿Qué queremos lograr?

Brookies Coffee es una cafetería familiar de un solo local. Hoy el control de insumos (café, leche, azúcar, harina, chocolate, etc.) es manual: el inventario se cuenta a mano una vez por semana, la rebaja de insumos se anota en planillas Excel y la cantidad a comprar se estima "al ojo". Esto provoca quiebres de stock, pérdidas y compras de urgencia.

El proyecto propone un **gestor de inventario** que:

- descuente automáticamente los insumos usados en cada pedido, según la receta de cada producto, y registre la venta;
- avise al administrador cuando un insumo llega a su nivel mínimo;
- permita ver el stock en tiempo real y recibir un informe al cierre del día con el stock, qué se vendió y la ganancia;
- deje registro de cada movimiento de inventario, para tener trazabilidad entre ventas y consumo.

En esta entrega el trabajo consiste en **levantar y documentar los requisitos**: entender el proceso actual, diseñar el proceso mejorado, y derivar de ahí los requisitos, las historias de usuario y los atributos de calidad. Todavía no se desarrolla el sistema.

## Alcance

**Dentro del alcance:** gestión de inventario de insumos, descuento de insumos por pedido, y registro de ventas y ganancia, en un solo local.

**Fuera del alcance:** toma de pedidos (menú, carrito), pago en línea, cuentas de clientes y comandas. Esas partes se abordan en otro ramo del equipo. El gestor recibe el pedido ya confirmado, con sus productos, cantidades y el monto de la venta.

## Documentos de la entrega

El punto de partida es el documento maestro: [`IngReq-Entrega 1.md`](./IngReq-Entrega%201.md).

| # | Documento | Qué contiene |
|---|-----------|--------------|
| 1 | [Proceso AS-IS](./01-proceso-as-is.md) | Cómo se controla y repone el inventario hoy, sin el gestor, con su diagrama BPMN y los problemas identificados |
| 2 | [Rediseño y TO-BE](./02-rediseno-to-be.md) | Mejoras por participante, iniciativas de rediseño con sus heurísticas, diagrama BPMN del proceso mejorado y actividades que cambian |
| 3 | [Clasificación de requisitos](./03-requisitos.md) | Requisitos de producto y de proyecto, y el requisito derivado |
| 4 | [Historias de usuario](./04-historias-usuario.md) | Historias con criterios de aceptación, asociadas a las actividades que cambian |
| 5 | [Elicitación](./05-elicitacion.md) | Entrevista y revisión documental con el dueño, hallazgos y acta |
| 6 | [Atributos de calidad](./06-atributos-calidad.md) | Priorización de los atributos de ISO 25010 y métricas de los tres principales |

## Estructura del repositorio

```
.
├── IngReq-Entrega 1.md        Documento maestro (índice, equipo y responsabilidades)
├── 01-proceso-as-is.md
├── 02-rediseno-to-be.md
├── 03-requisitos.md
├── 04-historias-usuario.md
├── 05-elicitacion.md
├── 06-atributos-calidad.md
├── diagramas/                 Diagramas BPMN (.png para verlos, .bpmn como fuente)
│   ├── as-is.png / as-is.bpmn
│   └── to-be.png / to-be.bpmn
├── evidencia/                 Fotos, capturas y notas de la elicitación
├── LICENSE
└── README.md
```

## Cómo leer y usar la documentación

1. Empieza por el documento maestro y sigue el índice en orden.
2. Los diagramas se ven directamente en los documentos 01 y 02. Para abrir o editar un `.bpmn`, arrástralo a [bpmn.io](https://demo.bpmn.io/) o ábrelo con Camunda Modeler.
3. Los elementos están numerados para poder seguirlos entre documentos:
   - **A01 a A12:** actividades del proceso AS-IS.
   - **N01 a N05:** actividades nuevas o modificadas del proceso TO-BE.
   - **RP-xx:** requisitos de producto. **RY-xx:** requisitos de proyecto.
   - **HU-xx:** historias de usuario.

## Equipo

- Felipe Cristóbal Hernández Olivares
- Simon Pedro Reyes Morales
- Paulo Andrés Salas Arismendi
- Vicente Andrés Coiro Martínez
- Martín Andrés Herrera Duranti

Profesor: Rene Noel.

El detalle de qué documento está a cargo de quién está en el documento maestro.

## Herramientas

- **GitHub** (organización, repositorio y Project) para publicar y organizar el trabajo.
- **BPMN 2.0** con bpmn.io o Camunda Modeler para modelar los procesos.
- **Markdown** para toda la documentación.
- **ISO/IEC 25010** como referencia de atributos de calidad.

## Licencia

Ver el archivo [`LICENSE`](./LICENSE).
