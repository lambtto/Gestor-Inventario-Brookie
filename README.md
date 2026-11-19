# Brookies Coffee — Gestor de inventario de insumos

Documentación de requisitos del proyecto de la cafetería **Brookies Coffee**, desarrollada para el ramo **CIN 324 Ingeniería de Requisitos** (Universidad de Valparaíso). Este repositorio contiene la **Entrega 1** (levantamiento de requisitos) y la **Entrega 2** (especificación del sistema).

## ¿Qué queremos lograr?

Brookies Coffee es una cafetería familiar de un solo local. Hoy el control de insumos (café, leche, azúcar, harina, chocolate, etc.) es manual: el inventario se cuenta a mano una vez por semana, la rebaja de insumos se anota en planillas Excel y la cantidad a comprar se estima "al ojo". Esto provoca quiebres de stock, pérdidas y compras de urgencia.

El proyecto propone un **gestor de inventario** que:

- descuente automáticamente los insumos usados en cada pedido, según la receta de cada producto, y registre la venta;
- avise al administrador cuando un insumo llega a su nivel mínimo;
- permita ver el stock en tiempo real y recibir un informe al cierre del día con el stock, qué se vendió y la ganancia;
- deje registro de cada movimiento de inventario, para tener trazabilidad entre ventas y consumo.

En la Entrega 1 el trabajo consistió en **levantar y documentar los requisitos**: entender el proceso actual, diseñar el proceso mejorado, y derivar de ahí los requisitos, las historias de usuario y los atributos de calidad. En la Entrega 2 esos requisitos se **especifican**: criterios de aceptación en Gherkin, modelo de dominio, casos de uso, diagramas de secuencia y de estado, y una matriz de trazabilidad. Todavía no se desarrolla el sistema.

## Alcance

**Dentro del alcance:** gestión de inventario de insumos, descuento de insumos por pedido, y registro de ventas y ganancia, en un solo local.

**Fuera del alcance:** toma de pedidos (menú, carrito), pago en línea, cuentas de clientes y comandas. Esas partes se abordan en otro ramo del equipo. El gestor recibe el pedido ya confirmado, con sus productos, cantidades y el monto de la venta.

## Documentos de la Entrega 1

El punto de partida es el documento maestro: [`IngReq-Entrega 1.md`](./IngReq-Entrega%201.md).

| # | Documento | Qué contiene |
|---|-----------|--------------|
| 1 | [Proceso AS-IS](./01-proceso-as-is.md) | Cómo se controla y repone el inventario hoy, sin el gestor, con su diagrama BPMN y los problemas identificados |
| 2 | [Rediseño y TO-BE](./02-rediseno-to-be.md) | Mejoras por participante, iniciativas de rediseño con sus heurísticas, diagrama BPMN del proceso mejorado y actividades que cambian |
| 3 | [Clasificación de requisitos](./03-requisitos.md) | Requisitos de producto y de proyecto, y el requisito derivado |
| 4 | [Historias de usuario](./04-historias-usuario.md) | Historias con criterios de aceptación, asociadas a las actividades que cambian |
| 5 | [Elicitación](./05-elicitacion.md) | Entrevista y revisión documental con el dueño, hallazgos y acta |
| 6 | [Atributos de calidad](./06-atributos-calidad.md) | Priorización de los atributos de ISO 25010 y métricas de los tres principales |

## Documentos de la Entrega 2

El documento maestro es [`IngReq-Entrega 2.md`](./IngReq-Entrega%202.md).

| # | Documento | Qué contiene |
|---|-----------|--------------|
| 1 | [Criterios de aceptación](./07-criterios-aceptacion.md) | Escenarios Gherkin de las siete historias de usuario |
| 2 | [Modelo de dominio](./08-modelo-dominio.md) | Diagrama de clases del negocio, clases, asociaciones y decisiones de modelado |
| 3 | [Casos de uso](./09-casos-de-uso.md) | Actores, diagrama de casos de uso y tabla con la historia de origen de cada caso |
| 4 | [Diagramas de secuencia](./10-diagramas-secuencia.md) | Seis diagramas de secuencia de sistema, dos con integración al sistema de toma de pedidos |
| 5 | [Diagramas de estado](./11-diagramas-estado.md) | Ciclo de vida de Insumo y de AlertaDeStock, con sus tablas de transiciones |
| 6 | [Trazabilidad](./12-trazabilidad.md) | Matriz que enlaza requisito, historia, caso de uso, secuencia, estado y clases |

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
├── IngReq-Entrega 2.md        Documento maestro de la Entrega 2
├── 07-criterios-aceptacion.md
├── 08-modelo-dominio.md
├── 09-casos-de-uso.md
├── 10-diagramas-secuencia.md
├── 11-diagramas-estado.md
├── 12-trazabilidad.md
├── diagramas/                 Diagramas (.png para verlos, fuente para editarlos)
│   ├── as-is.png / as-is.bpmn
│   ├── to-be.png / to-be.bpmn
│   ├── modelo-dominio, casos-de-uso, dss-01 a dss-06, est-01 y est-02 (.png / .puml)
├── evidencia/                 Fotos, capturas y notas de la elicitación
├── LICENSE
└── README.md
```

## Cómo leer y usar la documentación

1. Empieza por el documento maestro y sigue el índice en orden.
2. Los diagramas se ven directamente en los documentos. Para abrir o editar un `.bpmn`, arrástralo a [bpmn.io](https://demo.bpmn.io/) o ábrelo con Camunda Modeler; los `.puml` se abren con PlantUML.
3. Los elementos están numerados para poder seguirlos entre documentos:
   - **A01 a A12:** actividades del proceso AS-IS.
   - **N01 a N07:** actividades nuevas o modificadas del proceso TO-BE.
   - **RP-xx:** requisitos de producto. **RY-xx:** requisitos de proyecto.
   - **HU-xx:** historias de usuario. **CU-xx:** casos de uso. **DSS-xx:** diagramas de secuencia. **EST-xx:** diagramas de estado.

## Aplicación (gestor de inventario)

La aplicación se genera historia por historia desde estos documentos, con especificaciones de OpenSpec en [`openspec/`](./openspec/). Historias implementadas: **HU-06 Registrar insumos y recetas**.

### Cómo levantar el servidor y probar el sistema en localhost

**Requisitos:** [Node.js](https://nodejs.org/) 20 o superior (incluye `npm`). Para comprobarlo, ejecuta `node -v` en una terminal.

1. **Abre una terminal en la carpeta del repositorio** (en VS Code: menú *Terminal → Nueva terminal*).
2. **Instala las dependencias** (solo la primera vez, o cuando cambie `package.json`):
   ```bash
   npm install
   ```
3. **Crea la base de datos con los datos de ejemplo** (crea `data/app.db`; se puede repetir sin duplicar datos):
   ```bash
   npm run db:seed
   ```
4. **Levanta el servidor:**
   ```bash
   npm run dev
   ```
   Cuando aparezca `Gestor de inventario de Brookies Coffee en http://localhost:3000`, el sistema está listo. Con `npm run dev` el servidor se reinicia solo cuando cambia el código.
5. **Abre el navegador** en <http://localhost:3000> (redirige a la pantalla «Insumos»).
6. **Elige el rol «Administrador»** en el selector de arriba a la derecha: es el único rol con acceso al módulo de inventario.
7. **Para detener el servidor**, vuelve a la terminal y presiona `Ctrl + C`.

**Otras opciones:**

- **Correr las pruebas automáticas** (una por escenario Gherkin): `npm test`.
- **Partir de cero:** detén el servidor, borra la carpeta `data/` y vuelve a ejecutar `npm run db:seed`.
- **Si el puerto 3000 está ocupado**, usa otro puerto: en PowerShell `$env:PORT=3001; npm run dev`, y en Git Bash, macOS o Linux `PORT=3001 npm run dev`. Luego abre `http://localhost:3001`.
- **Iniciar sin reinicio automático:** `npm start`.

- **Pantallas:** «Insumos» (`/insumos`) y «Recetas» (`/recetas`). Arriba a la derecha hay un selector de rol de demostración (Administrador, Barista, Caja); no hay inicio de sesión real. Solo el Administrador puede usar el módulo de inventario.
- **Datos de ejemplo:** los 13 productos del cuaderno del dueño, sus 19 insumos (con las unidades del cuaderno) y 12 recetas; Banana Cloud queda sin receta. La canela no está en ninguna receta y tiene una reposición de 500 g. Los **costos unitarios y stocks mínimos son valores de demostración**, no datos del cliente.
- **Código:** `src/` (dominio, servicios, rutas, vistas EJS, migraciones SQL y datos de ejemplo) y `tests/`. Stack: TypeScript, Express, EJS, SQLite (better-sqlite3) y Vitest.

## Equipo

- Felipe Cristóbal Hernández Olivares
- Simón Pedro Reyes Morales
- Paulo Andrés Salas Arismendi
- Vicente Andrés Coiro Martínez
- Martín Andrés Herrera Duranti

Profesor: René Alejandro Noel López.

El detalle de qué documento está a cargo de quién está en el documento maestro.

## Herramientas

- **GitHub** (organización, repositorio y Project) para publicar y organizar el trabajo.
- **BPMN 2.0** con bpmn.io o Camunda Modeler para modelar los procesos.
- **Markdown** para toda la documentación.
- **ISO/IEC 25010** como referencia de atributos de calidad.

## Licencia

Ver el archivo [`LICENSE`](./LICENSE).
