# Atributos de calidad (ISO 25010)

<!-- BORRAR ESTOS COMENTARIOS AL FINALIZAR.
BORRADOR: la priorización se apoya en la respuesta del dueño a la pregunta 18 de la entrevista (lo peor: que el sistema se caiga y que sea difícil de usar) y en su pedido de "control total". El dueño nombró solo dos atributos, así que el orden entre ellos y el tercero es criterio del equipo: pedirle que los ordene al enviarle el acta. Los umbrales de las métricas también deben validarse con él y con el costo real del hosting. -->

## Priorización de los 9 atributos de primer nivel
1. **Fiabilidad** — lo peor para el dueño es que el sistema se caiga; el descuento de insumos en tiempo real solo sirve si el sistema está disponible cuando se vende (RP-10).
2. **Capacidad de interacción** — lo segundo peor es que sea difícil de usar; lo operarán el administrador, el barista y el personal de caja, sin experiencia técnica (RP-12).
3. **Adecuación funcional** — el dueño pide "control total": el descuento por receta y el stock deben ser correctos (RP-01, RP-07, RP-08).
4. **Seguridad** — el módulo solo debe usarlo el administrador y cada movimiento debe quedar registrado; el dueño no lo mencionó como su mayor preocupación (RP-08, RP-09).
5. **Eficiencia de desempeño** — tolera hasta 1 segundo de espera, un umbral exigente pero de bajo volumen (RP-11).
6. **Compatibilidad** — lo usaría desde un computador; hoy solo se exige Safari (RP-13).
7. **Mantenibilidad** — lo mantiene un equipo pequeño y podría crecer, pero no es urgente.
8. **Flexibilidad** — un solo local, sin multi-sucursal ni cambios de entorno previstos.
9. **Inocuidad (Safety)** — el software no controla equipos ni procesos con riesgo físico.

## Métricas de los 3 atributos más importantes
### Fiabilidad
- Métrica: **Disponibilidad del sistema.** X = A / B, donde A = tiempo de operación efectivamente provisto y B = tiempo de operación programado (horario de atención). Se mide mensualmente con un monitor de disponibilidad externo. Objetivo: X ≥ 0,999.
- Métrica: **Tiempo medio de indisponibilidad (Mean Down Time).** Promedio del tiempo que el sistema permanece caído desde que ocurre una falla hasta que se restablece el servicio, medido con el registro del monitor. Objetivo: ≤ 30 minutos.

### Capacidad de interacción
- Métrica: **Tasa de éxito al primer intento.** X = A / B, donde A = usuarios nuevos (administrador, barista o personal de caja) que completan una tarea representativa sin ayuda externa en su primer intento y B = usuarios que la intentaron. La tarea representativa es registrar una reposición de stock. Se mide con una prueba de uso con al menos 3 personas. Objetivo: X ≥ 0,9.
- Métrica: **Completitud de la guía de usuario.** X = A / B, donde A = funciones del sistema descritas y explicadas en la guía o ayuda al usuario y B = funciones totales del sistema. Se mide al cierre del desarrollo. Objetivo: X = 1.

### Adecuación funcional
- Métrica: **Corrección del descuento de insumos.** X = 1 − A / B, donde A = pedidos de prueba en que el stock descontado difiere del esperado según la receta y B = total de pedidos de prueba. Se mide ejecutando al menos 30 pedidos de prueba que cubran productos con uno y con varios insumos. Objetivo: X = 1 (ninguna diferencia).
- Métrica: **Completitud funcional.** X = A / B, donde A = requisitos funcionales de producto implementados y verificados y B = requisitos funcionales de producto especificados en 03-requisitos.md. Se mide al cierre de cada iteración. Objetivo: X ≥ 0,9.
