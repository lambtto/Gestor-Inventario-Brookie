// HU-01 · Especificación registro-ventas (CU-01, DSS-01, DSS-02; EST-01 / EST-02; RP-01, RP-02, RP-08, RP-09)
// Cada prueba usa su propia base en memoria (SH4, decisión C).
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadoProducto, dadaReceta, dadaReposicion, cuenta } from './ayuda.js';
import type { BaseDeDatos } from '../src/db/conexion.js';
import { aplicarEventoInsumo, alertasDeInsumo, estadoInsumo, obtenerInsumo } from '../src/dominio/insumo.js';
import { listarAvisosSinReceta, listarPedidos } from '../src/dominio/pedido.js';

/** Insumo con stock dado; la alerta queda Vigente solo si el stock está en o bajo el mínimo (como lo dejaría EST-02). */
function insumoConStock(db: BaseDeDatos, nombre: string, unidad: string, stock: number, minimo: number): number {
  const id = dadoInsumo(db, nombre, unidad, minimo);
  if (stock > 0) dadaReposicion(db, id, stock);
  if (stock > minimo) db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ?").run(id);
  return id;
}

/** Lemon Empire: 250 g de mantequilla, 300 g de harina y 1 cucharadita de vainilla; rinde 10 galletas. */
function lemonEmpire(db: BaseDeDatos, insumos: { mantequilla: number; harina: number; vainilla: number }): number {
  const id = dadoProducto(db, 'Lemon Empire');
  dadaReceta(db, id, 10, [
    { insumoId: insumos.mantequilla, cantidad: 250 },
    { insumoId: insumos.harina, cantidad: 300 },
    { insumoId: insumos.vainilla, cantidad: 1 },
  ]);
  return id;
}

function entornoLemon(stockMantequilla = 1000, minimoMantequilla = 100) {
  const { db, app } = nuevoEntorno();
  const mantequilla = insumoConStock(db, 'mantequilla', 'g', stockMantequilla, minimoMantequilla);
  const harina = insumoConStock(db, 'harina', 'g', 2000, 100);
  const vainilla = insumoConStock(db, 'vainilla', 'cucharadita', 20, 5);
  const lemon = lemonEmpire(db, { mantequilla, harina, vainilla });
  return { db, app, mantequilla, harina, vainilla, lemon };
}

type Linea = { producto: number | string; cantidad: string; monto: string };

/** El simulador envía el «Pedido confirmado» (filas del formulario). */
function confirmarPedido(app: Parameters<typeof request>[0], lineas: Linea[], rol = 'Caja') {
  const form: Record<string, string> = {};
  lineas.forEach((l, i) => {
    form[`producto_${i}`] = String(l.producto);
    form[`cantidad_${i}`] = l.cantidad;
    form[`monto_${i}`] = l.monto;
  });
  return request(app).post('/simulador').set('Cookie', `rol=${rol}`).type('form').send(form);
}

const stock = (db: BaseDeDatos, id: number) => obtenerInsumo(db, id)!.stock_actual;
const vigentes = (db: BaseDeDatos, id: number) => alertasDeInsumo(db, id).filter((a) => a.estado === 'Vigente').length;
const contar = (db: BaseDeDatos, tabla: string) => cuenta(db, `SELECT COUNT(*) AS n FROM ${tabla}`);

describe('HU-01 · Escenarios Gherkin', () => {
  it('HU-01 · Pedido confirmado cuyos productos tienen receta', async () => {
    // Dado que la receta de Lemon Empire usa 250 g de mantequilla y rinde 10 galletas
    // Y que el stock de mantequilla es de 1000 g
    const { db, app, mantequilla, harina, vainilla, lemon } = entornoLemon(1000);
    // Cuando el sistema de toma de pedidos confirma un pedido de 2 Lemon Empire por $7.000
    await confirmarPedido(app, [{ producto: lemon, cantidad: '2', monto: '7000' }]).expect(303);
    // Entonces el stock de mantequilla queda en 950 g
    expect(stock(db, mantequilla)).toBe(950);
    // Y se descuentan, en la misma proporción, los demás insumos de la receta
    expect(stock(db, harina)).toBe(2000 - 60);
    expect(stock(db, vainilla)).toBe(20 - 0.2);
    // Y queda registrada la venta de 2 Lemon Empire por $7.000
    const [pedido] = listarPedidos(db);
    expect(pedido!.ventas).toEqual([{ producto_nombre: 'Lemon Empire', cantidad: 2, monto: 7000, sin_receta: 0 }]);
    // Y queda registrado un Descuento de 50 g de mantequilla con su fecha y el pedido asociado
    const descuento = pedido!.descuentos.find((d) => d.insumo_nombre === 'mantequilla');
    expect(descuento).toMatchObject({ cantidad: 50, unidad_medida: 'g' });
    expect(Number.isNaN(Date.parse(descuento!.fecha))).toBe(false);
    expect(
      cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Descuento' AND insumo_id = ? AND pedido_id = ?", mantequilla, pedido!.id),
    ).toBe(1);
  });

  it('HU-01 · Pedido con un producto sin receta', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el Café Latte no tiene receta definida
    const latte = dadoProducto(db, 'Café Latte');
    // Y que el stock de leche es de 5000 ml
    const leche = insumoConStock(db, 'leche', 'ml', 5000, 500);
    // Cuando el sistema de toma de pedidos confirma un pedido de 1 Café Latte
    await confirmarPedido(app, [{ producto: latte, cantidad: '1', monto: '3500' }]).expect(303);
    // Entonces se informa al administrador que el Café Latte no tiene receta
    expect(listarAvisosSinReceta(db)).toEqual([{ producto_nombre: 'Café Latte', numero: 1 }]);
    const ventas = await request(app).get('/ventas').set('Cookie', 'rol=Administrador').expect(200);
    expect(ventas.text).toContain('Café Latte no tiene receta (pedido N° 1)');
    // Y queda registrada la venta de 1 Café Latte marcada como sin receta
    expect(listarPedidos(db)[0]!.ventas).toEqual([{ producto_nombre: 'Café Latte', cantidad: 1, monto: 3500, sin_receta: 1 }]);
    // Y el stock de leche sigue en 5000 ml
    expect(stock(db, leche)).toBe(5000);
    expect(cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Descuento'")).toBe(0);
  });

  it('HU-01 · Pedido que usa un insumo desactivado', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 5000, 100);
    const harina = insumoConStock(db, 'harina', 'g', 5000, 100);
    // Y que el nivel mínimo de la vainilla es de 5 cucharaditas y su stock es de 5 cucharaditas
    const vainilla = insumoConStock(db, 'vainilla', 'cucharadita', 5, 5);
    const lemon = lemonEmpire(db, { mantequilla, harina, vainilla });
    // Dado que la vainilla está desactivada y forma parte de la receta de Lemon Empire
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: vainilla });
    // Cuando el sistema de toma de pedidos confirma un pedido de 10 Lemon Empire
    await confirmarPedido(app, [{ producto: lemon, cantidad: '10', monto: '35000' }]).expect(303);
    // Entonces el stock de vainilla queda en 4 cucharaditas
    expect(stock(db, vainilla)).toBe(4);
    // Y queda registrado un Descuento de 1 cucharadita de vainilla
    expect(listarPedidos(db)[0]!.descuentos.find((d) => d.insumo_nombre === 'vainilla')).toMatchObject({
      cantidad: 1,
      unidad_medida: 'cucharadita',
    });
    // Y no se genera una alerta de stock crítico para la vainilla
    expect(vigentes(db, vainilla)).toBe(0);
    expect(estadoInsumo(obtenerInsumo(db, vainilla)!)).toBe('Desactivado');
  });
});

describe('HU-01 · Recibir un pedido confirmado', () => {
  it('El simulador envía un pedido confirmado (número, total y respuesta)', async () => {
    const { db, app, lemon } = entornoLemon();
    const latte = dadoProducto(db, 'Café Latte');
    const res = await confirmarPedido(app, [
      { producto: lemon, cantidad: '2', monto: '7.000' },
      { producto: latte, cantidad: '1', monto: '3500' },
    ]).redirects(1);
    const [pedido] = listarPedidos(db);
    expect(pedido).toMatchObject({ numero: 1, monto_total: 10500 });
    expect(Number.isNaN(Date.parse(pedido!.fecha_hora))).toBe(false);
    expect(res.text).toContain('Pedido N° 1 registrado');
    // El número es correlativo
    await confirmarPedido(app, [{ producto: lemon, cantidad: '1', monto: '3500' }]).redirects(1).expect(/Pedido N° 2 registrado/);
  });

  it.each([
    ['sin líneas', [] as Linea[]],
    ['cantidad 0', [{ producto: 'LEMON', cantidad: '0', monto: '3500' }]],
    ['cantidad decimal', [{ producto: 'LEMON', cantidad: '1.5', monto: '3500' }]],
    ['cantidad vacía', [{ producto: 'LEMON', cantidad: '', monto: '3500' }]],
    ['monto negativo', [{ producto: 'LEMON', cantidad: '1', monto: '-1' }]],
    ['monto con decimales', [{ producto: 'LEMON', cantidad: '1', monto: '3500,5' }]],
    ['una línea válida y otra inválida', [
      { producto: 'LEMON', cantidad: '2', monto: '7000' },
      { producto: 'LEMON', cantidad: 'x', monto: '7000' },
    ]],
  ])('Pedido con datos inválidos (%s) no registra nada', async (_caso, lineas) => {
    const { db, app, lemon, mantequilla } = entornoLemon(1000);
    const res = await confirmarPedido(app, lineas.map((l) => ({ ...l, producto: lemon })));
    expect(res.status).toBe(400);
    expect(res.text).toContain('Pedido rechazado (dato faltante o inválido)');
    expect(contar(db, 'pedidos')).toBe(0);
    expect(contar(db, 'ventas')).toBe(0);
    expect(cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Descuento'")).toBe(0);
    expect(stock(db, mantequilla)).toBe(1000);
  });
});

describe('HU-01 · Descuentos y alertas (EST-01 / EST-02)', () => {
  it('El descuento deja el stock negativo (decisión A)', async () => {
    const { db, app, mantequilla, lemon } = entornoLemon(0);
    await confirmarPedido(app, [{ producto: lemon, cantidad: '2', monto: '7000' }]).expect(303);
    expect(contar(db, 'pedidos')).toBe(1);
    expect(stock(db, mantequilla)).toBe(-50);
  });

  it('Un pedido deja el insumo en stock crítico', async () => {
    // mantequilla con 1000 g, mínimo 960 g y ninguna alerta vigente
    const { db, app, mantequilla, lemon } = entornoLemon(1000, 960);
    expect(vigentes(db, mantequilla)).toBe(0);
    await confirmarPedido(app, [{ producto: lemon, cantidad: '2', monto: '7000' }]).expect(303);
    expect(stock(db, mantequilla)).toBe(950);
    expect(vigentes(db, mantequilla)).toBe(1);
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Stock crítico');
  });

  it('Un insumo ya en stock crítico no recibe una segunda alerta (decisión B)', async () => {
    const { db, app, mantequilla, lemon } = entornoLemon(100, 500);
    expect(vigentes(db, mantequilla)).toBe(1);
    await confirmarPedido(app, [{ producto: lemon, cantidad: '2', monto: '7000' }]).expect(303);
    expect(stock(db, mantequilla)).toBe(50);
    expect(vigentes(db, mantequilla)).toBe(1);
  });
});

describe('HU-01 · Consultar las ventas registradas (RP-09)', () => {
  it('El administrador ve el pedido registrado', async () => {
    const { app, lemon } = entornoLemon(1000);
    await confirmarPedido(app, [{ producto: lemon, cantidad: '2', monto: '7000' }]).expect(303);
    const res = await request(app).get('/ventas').set('Cookie', 'rol=Administrador').expect(200);
    expect(res.text).toContain('Pedido N° 1');
    expect(res.text).toContain('$7.000');
    expect(res.text).toMatch(/Lemon Empire<\/td>\s*<td>2<\/td>/);
    expect(res.text).toMatch(/mantequilla<\/td>\s*<td>50 g<\/td>/);
  });

  it('Barista intenta ver las ventas', async () => {
    const { app } = entornoLemon();
    const res = await request(app).get('/ventas').set('Cookie', 'rol=Barista');
    expect(res.status).toBe(403);
    expect(res.text).toContain('Acceso solo para el administrador');
  });

  it('El simulador está disponible para cualquier rol (decisión E)', async () => {
    const { app } = entornoLemon();
    for (const rol of ['Administrador', 'Barista', 'Caja']) {
      await request(app).get('/simulador').set('Cookie', `rol=${rol}`).expect(200);
    }
  });
});
