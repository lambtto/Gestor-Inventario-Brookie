# Modelo de dominio

## Diagrama

![Modelo de dominio](./diagramas/modelo-dominio.png)

Archivo fuente: [`./diagramas/modelo-dominio.puml`](./diagramas/modelo-dominio.puml)

## Descripción de las clases

| Clase | Qué representa en el negocio | Atributos |
|-------|------------------------------|-----------|
| Insumo | Un ingrediente que se usa para preparar productos (café, leche, harina, etc.), con su stock y su nivel mínimo. | nombre, unidadMedida, costoUnitario, stockActual, stockMinimo, activo |
| Producto | Una bebida o galleta que Brookies Coffee vende (Café Latte, Lemon Empire, etc.). | nombre |
| Receta | La composición de un producto: qué insumos y en qué cantidad lleva. | rendimiento |
| Ingrediente | La cantidad de un insumo específico que una receta necesita (una línea de la receta). | cantidad |
| Pedido | Un pedido confirmado que llega desde el sistema de toma de pedidos, con sus productos y el monto a cobrar. | número, fechaHora, montoTotal |
| Venta | La venta de un producto dentro de un pedido: cuántas unidades y por cuánto monto. | cantidad, monto |
| MovimientoDeInventario *(abstracta)* | Un cambio en el stock de un insumo. Da la trazabilidad entre ventas y consumo que pide RP-08. | fecha, cantidad |
| Descuento | Movimiento que resta stock porque un pedido consumió insumos según la receta. | — |
| Reposición | Movimiento que suma stock porque el administrador registró la compra de un insumo. | responsable |
| AlertaDeStock | El aviso de que un insumo llegó o bajó de su nivel mínimo. Se conserva aunque se resuelva (ciclo de vida en EST-02). | fechaGeneración, estado |

## Asociaciones

| Asociación | Clases | Multiplicidades | Justificación |
|------------|--------|-----------------|----------------|
| tiene | Producto – Receta | 1 a 0..1 | Un producto puede no tener receta definida todavía; en ese caso el pedido que lo incluye no descuenta insumos (HU-01, CA5). |
| se compone de *(composición)* | Receta – Ingrediente | 1 a 1..\* | Una receta necesita al menos un insumo; un ingrediente no existe fuera de su receta (HU-06, CA2). |
| usa | Ingrediente – Insumo | \* a 1 | Cada línea de la receta corresponde a un único insumo, pero un mismo insumo aparece en varias recetas (base común de las masas, por ejemplo). |
| incluye *(composición)* | Pedido – Venta | 1 a 1..\* | Un pedido confirmado siempre trae al menos un producto vendido; la venta no existe fuera de su pedido (RP-01). |
| corresponde a | Venta – Producto | \* a 1 | Cada venta es de un único producto, y un producto aparece en muchas ventas. |
| afecta a | MovimientoDeInventario – Insumo | \* a 1 | Cada movimiento cambia el stock de un único insumo, y un insumo acumula un movimiento por cada descuento o reposición (RP-08). |
| se origina en | Descuento – Pedido | \* a 1 | Un pedido genera un descuento por cada insumo que consume; un descuento siempre viene de un pedido. |
| avisa sobre | AlertaDeStock – Insumo | \* a 1 | Un insumo puede acumular varias alertas a lo largo del tiempo (una por cada vez que llega al mínimo); cada alerta es de un único insumo. |
| *(generalización)* | MovimientoDeInventario ← Descuento, Reposición | — | Ambos son movimientos de stock con los mismos atributos base, pero el descuento nace de un pedido y la reposición lleva un responsable (RP-08). |

## Decisiones de modelado

- **El administrador, el barista y el personal de caja no se modelaron como clases.** Son roles de las personas, no conceptos del negocio: el acceso exclusivo del administrador es una política (RP-09), y quién registró una reposición queda como el atributo `responsable` de `Reposición`.
- **"Sistema de toma de pedidos" no se modela como clase del dominio**, porque es un sistema externo (de otro equipo), no un concepto del negocio de Brookies Coffee. Aparece como actor en los casos de uso y como participante externo en los diagramas de secuencia.
- **Composición** entre Receta e Ingrediente y entre Pedido y Venta, porque la parte no existe sin el todo. Entre Producto y Receta se usó una asociación simple: un producto puede existir sin receta (HU-01, CA5).
- **Herencia** solo en `MovimientoDeInventario` (con `Descuento` y `Reposición`), porque son los dos tipos de movimiento que pide RP-08 y se diferencian en su origen (pedido o administrador).
- **`AlertaDeStock` es una clase propia y no un atributo de `Insumo`**, porque una misma alerta tiene fecha y ciclo de vida (vigente o resuelta) y un insumo puede tener varias a lo largo del tiempo.
- **Las recetas no se versionan.** Cuando una receta cambia, el cambio vale para los pedidos siguientes y los descuentos ya registrados no se modifican (HU-06, CA4), porque cada `Descuento` guarda su propia cantidad.
