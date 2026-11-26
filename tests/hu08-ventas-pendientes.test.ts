// HU-08 · Especificación ventas-pendientes (CU-12, CU-13, CU-14; DSS-07; EST-03 y EST-01 / EST-02; RP-15, RP-08, RP-09)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadoProducto, dadaReceta, dadaReposicion, cuenta } from './ayuda.js';
import type { BaseDeDatos } from '../src/db/conexion.js';
import { alertasDeInsumo, obtenerInsumo } from '../src/dominio/insumo.js';
import { aplicarEventoVenta, obtenerVenta } from '../src/dominio/venta.js';
import { registrarPedidoConfirmado } from '../src/servicios/pedidos.js';
import { listarVentasPendientes } from '../src/servicios/ventas.js';

const stock = (db: BaseDeDatos, id: number) => obtenerInsumo(db, id)!.stock_actual;
const vigentes = (db: BaseDeDatos, id: number) => alertasDeInsumo(db, id).filter((a) => a.estado === 'Vigente').length;
const estado = (db: BaseDeDatos, ventaId: number) => obtenerVenta(db, ventaId)!.estado;

/**
 * Dado que la venta de 2 Lemon Empire del pedido 15 está «Pendiente de confirmación»: Lemon Empire usa 250 g de
 * mantequilla y rinde 10 galletas, hay 30 g de mantequilla (le faltan 20 g) y el pedido 15 la deja pendiente.
 */
function ventaPendiente(minimoMantequilla = 10) {
  const { db, app } = nuevoEntorno();
  const mantequilla = dadoInsumo(db, 'mantequilla', 'g', minimoMantequilla);
  dadaReposicion(db, mantequilla, 30);
  const producto = dadoProducto(db, 'Lemon Empire');
  dadaReceta(db, producto, 10, [{ insumoId: mantequilla, cantidad: 250 }]);
  registrarPedidoConfirmado(db, { numero: 15, productos: [{ producto: 'Lemon Empire', cantidad: 2, monto: 7000 }] });
  const ventaId = (db.prepare('SELECT id FROM ventas').get() as { id: number }).id;
  expect(estado(db, ventaId)).toBe('Pendiente de confirmación');
  return { db, app, mantequilla, ventaId };
}

describe('HU-08 · Ver ventas pendientes (CA1, CU-12)', () => {
  it('HU-08 · Ver las ventas pendientes', async () => {
    const { db, app } = ventaPendiente();
    // Cuando el administrador revisa las ventas pendientes
    const res = await request(app).get('/ventas/pendientes');
    expect(res.status).toBe(200);
    // Entonces ve la venta del pedido 15 con 2 Lemon Empire
    expect(listarVentasPendientes(db)).toEqual([
      expect.objectContaining({ numero_pedido: 15, producto: 'Lemon Empire', cantidad: 2 }),
    ]);
    expect(res.text).toContain('Lemon Empire');
    // Y ve que falta mantequilla (20 g)
    expect(res.text).toContain('Falta: mantequilla 20 g');
  });

  it('HU-08 · Ventas pendientes en JSON', async () => {
    const { app } = ventaPendiente();
    const res = await request(app).get('/ventas/pendientes').set('Accept', 'application/json');
    expect(res.body).toEqual([
      expect.objectContaining({
        numero_pedido: 15,
        producto: 'Lemon Empire',
        faltantes: [expect.objectContaining({ insumo: 'mantequilla', falta: 20 })],
      }),
    ]);
  });
});

describe('HU-08 · Confirmar venta (CA2, CA3, CU-13, EST-03)', () => {
  it('HU-08 · Confirmar una venta cuando llegan los insumos', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    // Y que había 30 g de mantequilla y se registró una Reposición de 1000 g
    dadaReposicion(db, mantequilla, 1000);
    // Cuando el administrador confirma la venta
    const res = await request(app).post(`/ventas/${ventaId}/confirmar`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Venta confirmada');
    // Entonces la mantequilla queda en 980 g
    expect(stock(db, mantequilla)).toBe(980);
    // Y queda registrado un Descuento de 50 g de mantequilla (asociado a la venta: Descuento – Venta)
    expect(
      db.prepare("SELECT cantidad, venta_id FROM movimientos_inventario WHERE tipo = 'Descuento'").all(),
    ).toEqual([{ cantidad: 50, venta_id: ventaId }]);
    // Y la venta queda «Confirmada»
    expect(estado(db, ventaId)).toBe('Confirmada');
    expect(listarVentasPendientes(db)).toHaveLength(0);
  });

  it('HU-08 · Confirmar sin stock suficiente', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    // Y que sigue habiendo 30 g de mantequilla
    const res = await request(app).post(`/ventas/${ventaId}/confirmar`);
    // Entonces no se confirma y se indica que falta mantequilla
    expect(res.status).toBe(409);
    expect(res.text).toContain('Confirmación rechazada (faltan: mantequilla 20 g)');
    // Y la mantequilla sigue en 30 g
    expect(stock(db, mantequilla)).toBe(30);
    expect(cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Descuento'")).toBe(0);
    // Y la venta sigue «Pendiente de confirmación»
    expect(estado(db, ventaId)).toBe('Pendiente de confirmación');
  });

  it('HU-08 · Confirmar deja un insumo en su mínimo', () => {
    // EST-01 / EST-02: Stock suficiente --Confirmar venta [stock resultante ≤ mínimo] / generar alerta--> Stock crítico
    const { db, mantequilla, ventaId } = ventaPendiente(100);
    dadaReposicion(db, mantequilla, 100); // 130 g > mínimo 100
    db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ?").run(mantequilla);
    aplicarEventoVenta(db, { tipo: 'confirmarVenta', ventaId });
    expect(stock(db, mantequilla)).toBe(80);
    expect(vigentes(db, mantequilla)).toBe(1);
  });
});

describe('HU-08 · Cancelar venta (CA4, CU-14, EST-03)', () => {
  it('HU-08 · Cancelar una venta pendiente', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    // Cuando el administrador cancela la venta
    const res = await request(app).post(`/ventas/${ventaId}/cancelar`);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Venta cancelada');
    // Entonces la venta queda «Cancelada»
    expect(estado(db, ventaId)).toBe('Cancelada');
    // Y la mantequilla sigue en 30 g
    expect(stock(db, mantequilla)).toBe(30);
    // Y la venta ya no aparece en las pendientes
    expect(listarVentasPendientes(db)).toHaveLength(0);
  });
});

describe('HU-08 · Solo se resuelven ventas pendientes (CA5, transiciones no modeladas en EST-03)', () => {
  it('HU-08 · No se puede confirmar una venta cancelada', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    aplicarEventoVenta(db, { tipo: 'cancelarVenta', ventaId });
    dadaReposicion(db, mantequilla, 1000);
    const res = await request(app).post(`/ventas/${ventaId}/confirmar`).set('Accept', 'application/json');
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Confirmación rechazada (la venta no está pendiente)');
    expect(estado(db, ventaId)).toBe('Cancelada');
    expect(stock(db, mantequilla)).toBe(1030);
  });

  it('HU-08 · No se puede cancelar una venta confirmada', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    dadaReposicion(db, mantequilla, 1000);
    aplicarEventoVenta(db, { tipo: 'confirmarVenta', ventaId });
    const res = await request(app).post(`/ventas/${ventaId}/cancelar`).set('Accept', 'application/json');
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Cancelación rechazada (la venta no está pendiente)');
    expect(estado(db, ventaId)).toBe('Confirmada');
  });

  it('HU-08 · No se puede confirmar dos veces', () => {
    const { db, mantequilla, ventaId } = ventaPendiente();
    dadaReposicion(db, mantequilla, 1000);
    aplicarEventoVenta(db, { tipo: 'confirmarVenta', ventaId });
    expect(() => aplicarEventoVenta(db, { tipo: 'confirmarVenta', ventaId })).toThrow(
      'Confirmación rechazada (la venta no está pendiente)',
    );
    expect(stock(db, mantequilla)).toBe(980);
  });

  it('HU-08 · Venta inexistente', async () => {
    const { app } = ventaPendiente();
    const res = await request(app).post('/ventas/999/confirmar').set('Accept', 'application/json');
    expect(res.status).toBe(404);
  });
});

describe('HU-08 · Acceso (RP-09)', () => {
  it('HU-08 · Solo el administrador resuelve ventas pendientes', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    dadaReposicion(db, mantequilla, 1000);
    const agente = request.agent(app);
    // Dado que el rol de demostración es Caja
    await agente.post('/rol').type('form').send({ rol: 'Caja', volver: '/ventas/pendientes' });
    // Cuando intenta ver, confirmar o cancelar una venta pendiente
    for (const res of [
      await agente.get('/ventas/pendientes'),
      await agente.post(`/ventas/${ventaId}/confirmar`),
      await agente.post(`/ventas/${ventaId}/cancelar`),
    ]) {
      // Entonces el sistema responde «Acceso solo para el administrador»
      expect(res.status).toBe(403);
      expect(res.text).toContain('Acceso solo para el administrador');
    }
    // Y la venta sigue pendiente
    expect(estado(db, ventaId)).toBe('Pendiente de confirmación');
  });

  it('HU-08 · Confirmar desde la pantalla', async () => {
    const { db, app, mantequilla, ventaId } = ventaPendiente();
    const pantalla = await request(app).get('/ventas/pendientes');
    expect(pantalla.text).toContain(`action="/ventas/${ventaId}/confirmar"`);
    expect(pantalla.text).toContain(`action="/ventas/${ventaId}/cancelar"`);
    dadaReposicion(db, mantequilla, 1000);
    const res = await request(app).post(`/ventas/${ventaId}/confirmar`).type('form').send({});
    expect(res.text).toContain('Venta confirmada');
    expect(res.text).toContain('No hay ventas pendientes');
    // La pantalla «Ventas» muestra el estado
    const ventas = await request(app).get('/ventas');
    expect(ventas.text).toContain('Confirmada');
  });
});

describe('HU-08 · Esquema (08-modelo-dominio.md, migración 006)', () => {
  it('HU-08 · Esquema de Venta con estado', () => {
    const { db, ventaId } = ventaPendiente();
    // Venta.estado solo acepta los estados de EST-03
    expect(() => db.prepare("UPDATE ventas SET estado = 'Anulada' WHERE id = ?").run(ventaId)).toThrow();
    // Descuento * – 1 Venta
    const columnas = (db.prepare('PRAGMA table_info(movimientos_inventario)').all() as { name: string }[]).map(
      (c) => c.name,
    );
    expect(columnas).toContain('venta_id');
  });
});
