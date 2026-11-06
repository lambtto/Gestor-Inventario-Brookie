# Diagramas de estado

Los eventos de estos diagramas son los mismos mensajes de los diagramas de secuencia ([10-diagramas-secuencia.md](./10-diagramas-secuencia.md)). Los eventos que no cambian el estado (por ejemplo, un pedido que baja el stock sin cruzar el nivel mínimo) no se dibujan.

## EST-01 — Ciclo de vida de Insumo

- Clase del dominio: [Insumo](./08-modelo-dominio.md)
- Diagramas de secuencia relacionados: [DSS-01](./10-diagramas-secuencia.md), [DSS-02](./10-diagramas-secuencia.md), [DSS-03](./10-diagramas-secuencia.md), [DSS-04](./10-diagramas-secuencia.md), [DSS-05](./10-diagramas-secuencia.md)

![EST-01](./diagramas/est-01.png)

Archivo fuente: [`./diagramas/est-01.puml`](./diagramas/est-01.puml)

### Tabla de transiciones

| Estado origen | Evento | Guarda | Acción | Estado destino |
|---------------|--------|--------|--------|----------------|
| (inicial) | Registrar insumo | — | generar alerta | Stock crítico |
| Stock suficiente | Pedido confirmado | stock resultante ≤ mínimo | generar alerta | Stock crítico |
| Stock crítico | Registrar ingreso | stock resultante > mínimo | resolver alerta | Stock suficiente |
| Stock suficiente | Desactivar insumo | — | — | Desactivado |
| Stock crítico | Desactivar insumo | — | resolver alerta | Desactivado |
| Stock suficiente | Eliminar insumo | no forma parte de ninguna receta y no tiene movimientos | — | (final) |
| Stock crítico | Eliminar insumo | no forma parte de ninguna receta y no tiene movimientos | eliminar alerta | (final) |
| Desactivado | Eliminar insumo | no forma parte de ninguna receta y no tiene movimientos | — | (final) |

Un insumo Desactivado que sigue en una receta también recibe Descuentos cuando se confirma un pedido, pero permanece en Desactivado y no genera alerta. Como ese evento no cambia su estado, no se dibuja.

Supuesto: HU-06 no pide un stock inicial al registrar un insumo, así que se asume que nace con stock 0, que está en o bajo cualquier nivel mínimo. Por eso nace en "Stock crítico" y con su alerta generada. Si el equipo decide cargar stock al registrar, hay que cambiar la primera fila de esta tabla y la de EST-02.

## EST-02 — Ciclo de vida de AlertaDeStock

- Clase del dominio: [AlertaDeStock](./08-modelo-dominio.md)
- Diagramas de secuencia relacionados: [DSS-02](./10-diagramas-secuencia.md), [DSS-03](./10-diagramas-secuencia.md), [DSS-04](./10-diagramas-secuencia.md), [DSS-05](./10-diagramas-secuencia.md)

![EST-02](./diagramas/est-02.png)

Archivo fuente: [`./diagramas/est-02.puml`](./diagramas/est-02.puml)

### Tabla de transiciones

| Estado origen | Evento | Guarda | Acción | Estado destino |
|---------------|--------|--------|--------|----------------|
| (inicial) | Pedido confirmado | stock del insumo ≤ mínimo y el insumo está activo | generar alerta | Vigente |
| (inicial) | Registrar insumo | — | generar alerta | Vigente |
| Vigente | Registrar ingreso | stock del insumo > mínimo | resolver alerta | Resuelta |
| Vigente | Desactivar insumo | — | resolver alerta | Resuelta |
| Vigente | Eliminar insumo | — | eliminar alerta | (final) |
| Resuelta | — *(al resolverse, la alerta se archiva; es una transición de finalización y no depende de un mensaje de ningún actor)* | — | archivar alerta | (final) |

Mientras la alerta está "Vigente" aparece en la consulta de alertas (CU-02); cuando pasa a "Resuelta" deja de mostrarse (HU-02, CA4). «Archivar alerta» no significa borrarla: la alerta deja de mostrarse en la consulta de alertas, pero se conserva como historial del insumo (ver AlertaDeStock en 08-modelo-dominio.md).
