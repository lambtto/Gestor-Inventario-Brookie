# Brookies Coffee — Gestor de inventario de insumos

Documentación de requisitos del proyecto de la cafetería **Brookies Coffee**, desarrollada para el ramo **CIN 324 Ingeniería de Requisitos** (Universidad de Valparaíso). Este repositorio contiene la **Entrega 1** (levantamiento de requisitos) y la **Entrega 2** (especificación del sistema).

## ¿Qué queremos lograr?

Brookies Coffee es una cafetería familiar de un solo local. Hoy el control de insumos (café, leche, azúcar, harina, chocolate, etc.) es manual: el inventario se cuenta a mano una vez por semana, la rebaja de insumos se anota en planillas Excel y la cantidad a comprar se estima "al ojo". Esto provoca quiebres de stock, pérdidas y compras de urgencia.

El proyecto propone un **gestor de inventario** que:

- descuente automáticamente los insumos usados en cada pedido, según la receta de cada producto, y registre la venta;
- avise al administrador cuando un insumo llega a su nivel mínimo;
- permita ver el stock en tiempo real y recibir un informe al cierre del día con el stock, qué se vendió y la ganancia;
- deje registro de cada movimiento de inventario, para tener trazabilidad entre ventas y consumo.

En la Entrega 1 el trabajo consistió en **levantar y documentar los requisitos**: entender el proceso actual, diseñar el proceso mejorado, y derivar de ahí los requisitos, las historias de usuario y los atributos de calidad. En la Entrega 2 esos requisitos se **especifican**: criterios de aceptación en Gherkin, modelo de dominio, casos de uso, diagramas de secuencia y de estado, y una matriz de trazabilidad. En la Entrega de proyecto 3 el sistema se genera historia por historia desde esos documentos (ver «Aplicación»).

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
├── src/                       Código de la aplicación (TypeScript + Express + EJS + SQLite)
├── tests/                     Pruebas automáticas (una por escenario Gherkin)
├── openspec/                  Especificaciones y cambios de OpenSpec (specs vigentes y changes/archive)
├── .cin324/                   Estado del proyecto y fichas de historia confirmadas
├── .claude/                   Skills y comandos del curso para generar la aplicación
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

La aplicación se genera historia por historia desde estos documentos, con especificaciones de OpenSpec en [`openspec/`](./openspec/). Historias implementadas: **HU-06 Registrar insumos y recetas** (con el ajuste del 2026-11-19: editar y reactivar insumos, nombre con al menos una letra, costo en pesos chilenos y ventana emergente) **HU-07 Ajustar stock** (mermas y corrección de conteo) **HU-01 Registrar venta** (cada pedido confirmado registra sus ventas y descuenta los insumos según la receta) y **HU-05 Registrar ingreso de stock** (reposición de los insumos comprados).

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

- **Pantallas:** «Insumos» (`/insumos`), «Recetas» (`/recetas`) y «Ajustar stock» (`/ajustes`: registra una merma o una corrección de conteo; el selector muestra el stock actual de cada insumo y abajo se listan los ajustes registrados). En «Insumos», los botones «Registrar insumo» y «Editar» abren una ventana emergente centrada; cada insumo se puede eliminar, desactivar o, si está desactivado, reactivar. Los costos están en pesos chilenos (CLP), son enteros y se muestran como $1.250. Arriba a la derecha hay un selector de rol de demostración (Administrador, Barista, Caja); no hay inicio de sesión real. Solo el Administrador puede usar el módulo de inventario.
- **Pantallas de HU-01:** «Simulador de pedidos» (`/simulador`) hace de *Sistema de toma de pedidos* (sistema externo, simulado): envía un «Pedido confirmado» con hasta 3 productos, su cantidad y su monto en pesos. «Ventas» (`/ventas`, solo Administrador) lista las ventas registradas y los avisos de producto sin receta. Un sistema externo también puede enviar el pedido en JSON a `POST /pedidos` con `{"numero": 1, "productos": [{"producto": "Lemon Empire", "cantidad": 2, "monto": 7000}]}`.
- **Pantalla de HU-05:** «Registrar ingreso» (`/ingresos`, solo Administrador) registra la cantidad recibida de un insumo comprado: el stock sube, queda la reposición en la lista de abajo y, si el insumo supera su mínimo, su alerta de stock crítico se resuelve. Los insumos desactivados no se pueden reponer (primero se reactivan en «Insumos»).
- **Recorrido de demostración de HU-01:** los insumos de ejemplo nacen con stock 0, así que primero carga stock en «Registrar ingreso» (por ejemplo, 1000 g de mantequilla). Luego, en «Simulador de pedidos», envía 2 Lemon Empire por 7.000 y 1 Banana Cloud por 4.000: la mantequilla baja a 950 g, «Ventas» muestra las dos ventas y aparece el aviso de que Banana Cloud no tiene receta. Si un pedido deja un insumo activo en o bajo su mínimo, se genera su alerta de stock crítico.
- **Datos de ejemplo:** los 13 productos del cuaderno del dueño, sus 19 insumos (con las unidades del cuaderno) y 12 recetas; Banana Cloud queda sin receta. El «espresso doble» del cuaderno no es un insumo: el Café Latte y el Capuchino usan 16 g de **café en grano** (aclaración en `05-elicitacion.md`); la migración `003` corrige las bases creadas antes de este ajuste. La canela no está en ninguna receta y tiene una reposición de 500 g. Los **costos unitarios y stocks mínimos son valores de demostración**, no datos del cliente. Al arrancar, la migración `002` redondea a pesos enteros los costos de una base creada antes del ajuste.
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
