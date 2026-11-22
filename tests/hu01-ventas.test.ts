// HU-01 · Especificación registro-ventas (CU-01, DSS-01, DSS-02; EST-01 / EST-02; RP-01, RP-02, RP-08, RP-09)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadoProducto, dadaReceta, dadaReposicion, cuenta } from './ayuda.js';
import type { BaseDeDatos } from '../src/db/conexion.js';
import { aplicarEventoInsumo, alertasDeInsumo, estadoInsumo, obtenerInsumo } from '../src/dominio/insumo.js';
import { listarVentas, registrarPedidoConfirmado } from '../src/servicios/pedidos.js';

/** Insumo con stock dado; la alerta queda Vigente solo si el stock está en o bajo el mínimo (como lo dejaría EST-02). */
function insumoConStock(db: BaseDeDatos, nombre: string, unidad: string, stock: number, minimo: number): number {
  const id = dadoInsumo(db, nombre, unidad, minimo);
  if (stock > 0) dadaReposicion(db, id, stock);
  if (stock > minimo) db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ?").run(id);
  return id;
}

const stock = (db: BaseDeDatos, id: number) => obtenerInsumo(db, id)!.stock_actual;
const vigentes = (db: BaseDeDatos, id: number) => alertasDeInsumo(db, id).filter((a) => a.estado === 'Vigente').length;
const descuentos = (db: BaseDeDatos, insumoId: number) =>
  db
    .prepare(
      `SELECT m.cantidad, m.fecha, p.numero FROM movimientos_inventario m JOIN pedidos p ON p.id = m.pedido_id
       WHERE m.tipo = 'Descuento' AND m.insumo_id = ?`,
    )
    .all(insumoId) as { cantidad: number; fecha: string; numero: number }[];

/** Lemon Empire con la base de masa reducida a mantequilla, harina y vainilla (rinde 10 galletas). */
function lemonEmpire(db: BaseDeDatos, insumos: { mantequilla: number; harina: number; vainilla?: number }): number {
  const producto = dadoProducto(db, 'Lemon Empire');
  const lineas = [
    { insumoId: insumos.mantequilla, cantidad: 250 },
    { insumoId: insumos.harina, cantidad: 400 },
  ];
  if (insumos.vainilla) lineas.push({ insumoId: insumos.vainilla, cantidad: 1 });
  dadaReceta(db, producto, 10, lineas);
  return producto;
}

/** El Sistema de toma de pedidos (simulado) envía un «Pedido confirmado» en JSON. */
function confirmarPedido(app: Parameters<typeof request>[0], numero: number | string, productos: object[]) {
  return request(app).post('/pedidos').send({ numero, productos });
}

describe('HU-01 · Descontar insumos y registrar la venta (CA1–CA4)', () => {
  it('HU-01 · Pedido confirmado cuyos productos tienen receta', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
    // Y que el stock de mantequilla es de 1000 g
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 1000, 500);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 2000, 500);
    lemonEmpire(db, { mantequilla, harina });
    // Cuando el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
    const res = await confirmarPedido(app, 1, [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }]);
    expect(res.status).toBe(201);
    expect(res.body.mensaje).toBe('Pedido registrado');
    // Entonces el stock de mantequilla queda en 950 g
    expect(stock(db, mantequilla)).toBe(950);
    // Y se descuentan, en la misma proporción, los demás insumos de la receta (400 g ÷ 10 × 2 = 80 g)
    expect(stock(db, harina)).toBe(1920);
    // Y queda registrada la venta de 2 Lemon Empire por $7.000
    expect(listarVentas(db)).toEqual([
      expect.objectContaining({ numero_pedido: 1, producto: 'Lemon Empire', cantidad: 2, monto: 7000, sin_receta: 0 }),
    ]);
    // Y queda registrado un Descuento de 50 g de mantequilla con su fecha y el pedido asociado
    const [descuento] = descuentos(db, mantequilla);
    expect(descuento).toMatchObject({ cantidad: 50, numero: 1 });
    expect(Number.isNaN(Date.parse(descuento!.fecha))).toBe(false);
  });

  it('HU-01 · Pedido con varios productos', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 1000, 100);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 2000, 100);
    const chip = insumoConStock(db, 'chocolate chip', 'g', 500, 50);
    lemonEmpire(db, { mantequilla, harina });
    const soho = dadoProducto(db, 'SoHo');
    dadaReceta(db, soho, 10, [
      { insumoId: mantequilla, cantidad: 250 },
      { insumoId: chip, cantidad: 100 },
    ]);
    const res = await confirmarPedido(app, 7, [
      { producto: 'Lemon Empire', cantidad: 2, monto: 7000 },
      { producto: 'SoHo', cantidad: 1, monto: 3000 },
    ]);
    expect(res.status).toBe(201);
    // Pedido con monto total de $10.000 y dos Ventas
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM pedidos WHERE numero = 7 AND monto_total = 10000')).toBe(1);
    expect(listarVentas(db)).toHaveLength(2);
    // Se descuentan los insumos de ambas recetas: mantequilla 50 + 25
    expect(stock(db, mantequilla)).toBe(925);
    expect(stock(db, chip)).toBe(490);
  });
});

describe('HU-01 · Producto sin receta (CA5)', () => {
  it('HU-01 · Pedido con un producto sin receta', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el Banana Cloud no tiene receta definida
    dadoProducto(db, 'Banana Cloud');
    // Y que el stock de leche es de 5000 ml
    const leche = insumoConStock(db, 'leche', 'ml', 5000, 3000);
    // Cuando el sistema de toma de pedidos confirma un pedido de 1 Banana Cloud
    const res = await confirmarPedido(app, 2, [{ producto: 'Banana Cloud', cantidad: 1, monto: 3500 }]);
    // Entonces se informa al administrador que el Banana Cloud no tiene receta
    expect(res.body.avisos).toEqual(['Aviso de producto sin receta (Banana Cloud)']);
    // Y queda registrada la venta de 1 Banana Cloud marcada como sin receta
    expect(listarVentas(db)).toEqual([expect.objectContaining({ producto: 'Banana Cloud', cantidad: 1, sin_receta: 1 })]);
    // Y el stock de leche sigue en 5000 ml
    expect(stock(db, leche)).toBe(5000);
    expect(cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Descuento'")).toBe(0);
  });
});

describe('HU-01 · Insumo desactivado en la receta (CA6)', () => {
  it('HU-01 · Pedido que usa un insumo desactivado', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 5000, 500);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 8000, 500);
    // Y que el nivel mínimo de la vainilla es de 5 cucharaditas y su stock es de 5 cucharaditas
    const vainilla = insumoConStock(db, 'vainilla', 'cucharadita', 5, 5);
    // Dado que la vainilla está desactivada y forma parte de la receta de Lemon Empire
    lemonEmpire(db, { mantequilla, harina, vainilla });
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: vainilla });
    expect(estadoInsumo(obtenerInsumo(db, vainilla)!)).toBe('Desactivado');
    // Cuando el sistema de toma de pedidos confirma un pedido de 10 Lemon Empire
    const res = await confirmarPedido(app, 3, [{ producto: 'Lemon Empire', cantidad: 10, monto: 35000 }]);
    expect(res.status).toBe(201);
    // Entonces el stock de vainilla queda en 4 cucharaditas
    expect(stock(db, vainilla)).toBe(4);
    // Y queda registrado un Descuento de 1 cucharadita de vainilla
    expect(descuentos(db, vainilla)).toEqual([expect.objectContaining({ cantidad: 1, numero: 3 })]);
    // Y no se genera una alerta de stock crítico para la vainilla (sigue Desactivado)
    expect(vigentes(db, vainilla)).toBe(0);
    expect(estadoInsumo(obtenerInsumo(db, vainilla)!)).toBe('Desactivado');
  });
});

describe('HU-01 · Alerta de stock crítico por un pedido (DSS-02, EST-01 / EST-02)', () => {
  it('HU-01 · El pedido deja un insumo activo en su mínimo', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 550, 500);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 5000, 500);
    lemonEmpire(db, { mantequilla, harina });
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Stock suficiente');
    expect(vigentes(db, mantequilla)).toBe(0);
    await confirmarPedido(app, 4, [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }]);
    // Stock suficiente --Pedido confirmado [stock resultante ≤ mínimo] / generar alerta--> Stock crítico
    expect(stock(db, mantequilla)).toBe(500);
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Stock crítico');
    expect(vigentes(db, mantequilla)).toBe(1);
    // La harina sigue sobre su mínimo: sin alerta
    expect(vigentes(db, harina)).toBe(0);
  });

  it('HU-01 · El insumo ya tenía una alerta vigente', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 500, 500);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 5000, 500);
    lemonEmpire(db, { mantequilla, harina });
    expect(vigentes(db, mantequilla)).toBe(1);
    await confirmarPedido(app, 5, [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }]);
    // Stock crítico --Pedido confirmado--> Stock crítico, sin una segunda alerta
    expect(stock(db, mantequilla)).toBe(450);
    expect(vigentes(db, mantequilla)).toBe(1);
  });

  it('HU-01 · El pedido deja el stock negativo', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 30, 10);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 5000, 500);
    lemonEmpire(db, { mantequilla, harina });
    const res = await confirmarPedido(app, 6, [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }]);
    // Decisión D1: el pedido se registra igual
    expect(res.status).toBe(201);
    expect(stock(db, mantequilla)).toBe(-20);
    expect(vigentes(db, mantequilla)).toBe(1);
  });
});

describe('HU-01 · Rechazar un pedido inválido (decisión D2)', () => {
  it('HU-01 · Pedido repetido', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 1000, 100);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 2000, 100);
    lemonEmpire(db, { mantequilla, harina });
    // Dado que el pedido número 15 ya fue registrado
    await confirmarPedido(app, 15, [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }]);
    // Cuando el sistema de toma de pedidos vuelve a enviar el pedido número 15
    const res = await confirmarPedido(app, 15, [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }]);
    // Entonces el sistema responde «Pedido rechazado (pedido ya registrado)»
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Pedido rechazado (pedido ya registrado)');
    // Y el stock no vuelve a descontarse
    expect(stock(db, mantequilla)).toBe(950);
    expect(listarVentas(db)).toHaveLength(1);
  });

  it('HU-01 · Producto inexistente', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 1000, 100);
    const harina = insumoConStock(db, 'harina con polvos', 'g', 2000, 100);
    lemonEmpire(db, { mantequilla, harina });
    const res = await confirmarPedido(app, 8, [
      { producto: 'Lemon Empire', cantidad: 1, monto: 3500 },
      { producto: 'Torta de Mora', cantidad: 1, monto: 4000 },
    ]);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Pedido rechazado (producto no encontrado: Torta de Mora)');
    // No registra nada (todo o nada)
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM pedidos')).toBe(0);
    expect(stock(db, mantequilla)).toBe(1000);
  });

  it('HU-01 · Datos inválidos', () => {
    const { db } = nuevoEntorno();
    dadoProducto(db, 'Banana Cloud');
    const linea = { producto: 'Banana Cloud', cantidad: 1, monto: 4000 };
    expect(() => registrarPedidoConfirmado(db, { numero: '', productos: [linea] })).toThrow(
      'Pedido rechazado (falta el número de pedido o no es un entero mayor que 0)',
    );
    expect(() => registrarPedidoConfirmado(db, { numero: 1, productos: [] })).toThrow(
      'Pedido rechazado (el pedido no trae productos)',
    );
    expect(() => registrarPedidoConfirmado(db, { numero: 1, productos: [{ ...linea, cantidad: 0 }] })).toThrow(
      'Pedido rechazado (la cantidad de Banana Cloud debe ser un entero mayor que 0)',
    );
    expect(() => registrarPedidoConfirmado(db, { numero: 1, productos: [{ ...linea, monto: -5 }] })).toThrow(
      'Pedido rechazado (el monto de Banana Cloud debe ser un entero en pesos mayor o igual a 0)',
    );
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM pedidos')).toBe(0);
  });
});

describe('HU-01 · Pantallas: Simulador de pedidos y Ventas (S4, decisión D3, RP-09)', () => {
  it('HU-01 · Simulador de pedidos', async () => {
    const { db, app } = nuevoEntorno();
    dadoProducto(db, 'Banana Cloud');
    const pantalla = await request(app).get('/simulador');
    expect(pantalla.status).toBe(200);
    expect(pantalla.text).toContain('Banana Cloud (sin receta)');
    // El formulario envía el «Pedido confirmado» (monto con punto de miles) y muestra el resultado
    const res = await request(app)
      .post('/pedidos')
      .type('form')
      .send({ numero: '1', producto1: 'Banana Cloud', cantidad1: '2', monto1: '8.000' });
    expect(res.status).toBe(201);
    expect(res.text).toContain('Pedido registrado (pedido N° 1)');
    expect(res.text).toContain('Aviso de producto sin receta (Banana Cloud)');
    expect(listarVentas(db)).toEqual([expect.objectContaining({ producto: 'Banana Cloud', cantidad: 2, monto: 8000 })]);
  });

  it('HU-01 · El administrador ve la venta sin receta', async () => {
    const { db, app } = nuevoEntorno();
    dadoProducto(db, 'Banana Cloud');
    // Dado que se registró un pedido con 1 Banana Cloud, que no tiene receta
    registrarPedidoConfirmado(db, { numero: 9, productos: [{ producto: 'Banana Cloud', cantidad: 1, monto: 4000 }] });
    // Cuando el administrador abre «Ventas»
    const res = await request(app).get('/ventas');
    // Entonces ve la venta de Banana Cloud marcada «Sin receta» y el aviso de producto sin receta
    expect(res.status).toBe(200);
    expect(res.text).toContain('Banana Cloud');
    expect(res.text).toContain('Sin receta');
    expect(res.text).toContain('$4.000');
    expect(res.text).toContain('Aviso de producto sin receta (Banana Cloud)');
  });

  it('HU-01 · Otro rol intenta ver las ventas', async () => {
    const { app } = nuevoEntorno();
    const agente = request.agent(app);
    // Dado que el rol de demostración es Barista
    await agente.post('/rol').type('form').send({ rol: 'Barista', volver: '/ventas' });
    // Cuando abre «Ventas»
    const res = await agente.get('/ventas');
    // Entonces el sistema responde «Acceso solo para el administrador»
    expect(res.status).toBe(403);
    expect(res.text).toContain('Acceso solo para el administrador');
  });

  it('HU-01 · Pedido confirmado en JSON', async () => {
    const { db, app } = nuevoEntorno();
    dadoProducto(db, 'Banana Cloud');
    const res = await confirmarPedido(app, 10, [{ producto: 'Banana Cloud', cantidad: 1, monto: 4000 }]);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      mensaje: 'Pedido registrado',
      numero: 10,
      avisos: ['Aviso de producto sin receta (Banana Cloud)'],
    });
  });
});

describe('HU-01 · Esquema de Venta (08-modelo-dominio.md)', () => {
  it('HU-01 · Esquema de Venta', () => {
    const { db } = nuevoEntorno();
    const columnas = (db.prepare('PRAGMA table_info(ventas)').all() as { name: string }[]).map((c) => c.name);
    expect(columnas).toEqual(['id', 'pedido_id', 'producto_id', 'cantidad', 'monto', 'sin_receta']);
    const producto = dadoProducto(db, 'Banana Cloud');
    const pedido = Number(
      db.prepare("INSERT INTO pedidos (numero, fecha_hora, monto_total) VALUES (1, '2026-11-21', 0)").run().lastInsertRowid,
    );
    // Venta.cantidad > 0
    expect(() =>
      db.prepare('INSERT INTO ventas (pedido_id, producto_id, cantidad, monto) VALUES (?, ?, 0, 0)').run(pedido, producto),
    ).toThrow();
  });
});
