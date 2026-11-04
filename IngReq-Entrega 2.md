# Ingeniería de Requisitos — Entrega 2

## Equipo

- Felipe Cristóbal Hernández Olivares
- Simón Pedro Reyes Morales
- Paulo Andrés Salas Arismendi
- Vicente Andrés Coiro Martínez
- Martín Andrés Herrera Duranti

Profesor: René Alejandro Noel López.

## Proyecto

**Brookies Coffee — Gestor de inventario de insumos.** Especificación detallada del sistema definido en la Entrega 1: parte de los requisitos (`03-requisitos.md`) y las historias de usuario (`04-historias-usuario.md`) ya documentados, y los especifica con criterios de aceptación en Gherkin, modelo de dominio, casos de uso, diagramas de secuencia de sistema, diagramas de estado y la matriz de trazabilidad que enlaza todos los artefactos.

## Responsabilidades individuales

| Documento | Ítem de rúbrica | Responsable(s) |
|-----------|-----------------|----------------|
| 07-criterios-aceptacion.md | 1 | Vicente Coiro Martínez |
| 08-modelo-dominio.md | 2 | Paulo Salas Arismendi |
| 09-casos-de-uso.md | 3 | Martín Herrera Duranti |
| 10-diagramas-secuencia.md | 4 | Simón Reyes Morales |
| 11-diagramas-estado.md | 5 | Simón Reyes Morales |
| 12-trazabilidad.md | 6 | Felipe Hernández Olivares |

## Uso de IA generativa

Se usó Claude (Anthropic) para redactar un primer borrador de los criterios de aceptación en Gherkin, el modelo de dominio, los casos de uso, los diagramas de secuencia y de estado, la matriz de trazabilidad y los archivos fuente PlantUML de los diagramas, a partir de los requisitos y las historias de usuario de la Entrega 1. El equipo revisó el borrador contra las historias, el TO-BE y los requisitos, y lo corrigió: se sacaron reglas que la IA había inventado y que no están en ninguna historia (por ejemplo, rechazar ingresos de stock de un insumo desactivado), se unificaron los nombres entre documentos (Descuento, Reposición, alerta vigente, Sistema de toma de pedidos) y se ajustó la HU-01 y el texto del TO-BE para que el pedido confirmado llegue desde el sistema de toma de pedidos y no lo confirme el administrador. Los montos y stocks de los ejemplos Gherkin son ilustrativos y no vienen de datos reales del local.

## Entrega anterior

[IngReq-Entrega 1](./IngReq-Entrega%201.md)

## Índice de documentos

1. [Criterios de aceptación (Gherkin)](./07-criterios-aceptacion.md)
2. [Modelo de dominio](./08-modelo-dominio.md)
3. [Casos de uso](./09-casos-de-uso.md)
4. [Diagramas de secuencia de sistema](./10-diagramas-secuencia.md)
5. [Diagramas de estado](./11-diagramas-estado.md)
6. [Trazabilidad](./12-trazabilidad.md)
