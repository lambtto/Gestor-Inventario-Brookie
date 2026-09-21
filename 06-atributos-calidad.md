# Atributos de calidad (ISO 25010)

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: la priorización es una propuesta. Validarla con la pregunta 17 de la entrevista (qué sería peor: caída, lentitud, dificultad de uso o filtración de datos) y con el equipo. Los umbrales de las métricas también deben validarse con el dueño y con el costo real del hosting. -->

## Priorización de los 9 atributos de primer nivel
1. **Adecuación funcional** — el valor del sistema es que el descuento de insumos por receta sea correcto; si falla, el inventario deja de ser confiable (RP-01, RP-07, RP-08).
2. **Fiabilidad** — el descuento debe funcionar cada vez que se confirma un pedido y el stock debe quedar consistente (RP-10).
3. **Seguridad** — el stock y los movimientos solo pueden ser modificados por el administrador, y cada cambio debe quedar registrado (RP-08, RP-09).
4. **Capacidad de interacción** — el administrador no tiene experiencia técnica y debe operar el módulo sin capacitación (RP-12).
5. **Eficiencia de desempeño** — importa, pero un local pequeño tiene bajo volumen de pedidos simultáneos (RP-11).
6. **Compatibilidad** — hoy solo se exige Safari (RP-13).
7. **Mantenibilidad** — lo mantiene un equipo pequeño y podría crecer, pero no es urgente.
8. **Flexibilidad** — un solo local, sin multi-sucursal ni cambios de entorno previstos.
9. **Inocuidad (Safety)** — el software no controla equipos ni procesos con riesgo físico.

## Métricas de los 3 atributos más importantes
### Adecuación funcional
- Métrica: **Corrección del descuento de insumos.** X = 1 − A / B, donde A = pedidos de prueba en que el stock descontado difiere del esperado según la receta y B = total de pedidos de prueba. Se mide ejecutando al menos 30 pedidos de prueba que cubran productos con uno y con varios insumos. Objetivo: X = 1 (ninguna diferencia).
- Métrica: **Completitud funcional.** X = A / B, donde A = requisitos funcionales de producto implementados y verificados y B = requisitos funcionales de producto especificados en 03-requisitos.md. Se mide al cierre de cada iteración. Objetivo: X ≥ 0,9.

### Fiabilidad
- Métrica: **Disponibilidad del sistema.** X = A / B, donde A = tiempo de operación efectivamente provisto y B = tiempo de operación programado (horario de atención). Se mide mensualmente con un monitor de disponibilidad externo. Objetivo: X ≥ 0,999.
- Métrica: **Tiempo medio de indisponibilidad (Mean Down Time).** Promedio del tiempo que el sistema permanece caído desde que ocurre una falla hasta que se restablece el servicio, medido con el registro del monitor. Objetivo: ≤ 30 minutos.

### Seguridad
- Métrica: **Controlabilidad del acceso.** X = 1 − A / B, donde A = ítems de datos confidenciales (stock, recetas, movimientos) accesibles o modificables sin autorización y B = total de ítems confidenciales. Se mide con pruebas de acceso: un usuario sin rol de administrador intentando entrar al módulo y modificar datos. Objetivo: X = 1.
- Métrica: **Completitud del registro de movimientos.** X = A / B, donde A = movimientos de inventario (descuentos y reposiciones) con registro completo de fecha, cantidad y pedido o usuario asociado y B = total de movimientos ejecutados en las pruebas. Se verifica revisando la tabla de movimientos. Objetivo: X = 1.
