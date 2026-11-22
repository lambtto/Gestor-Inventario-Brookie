// HU-05 · Especificación ingreso-stock (CU-05, DSS-03; EST-01 / EST-02; RP-05, RP-08, RP-09)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadaReposicion, cuenta } from './ayuda.js';
import type { BaseDeDatos } from '../src/db/conexion.js';
import { aplicarEventoInsumo, alertasDeInsumo, estadoInsumo, obtenerInsumo } from '../src/dominio/insumo.js';
import { listarReposiciones } from '../src/servicios/ingresos.js';

/** Insumo con stock dado; la alerta queda Vigente solo si el stock está en o bajo el mínimo (como lo dejaría EST-02). */
function insumoConStock(db: BaseDeDatos, nombre: string, unidad: string, stock: number, minimo: number): number {
  const id = dadoInsumo(db, nombre, unidad, minimo);
  if (stock > 0) dadaReposicion(db, id, stock);
  if (stock > minimo) db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ?").run(id);
  return id;
}

const stock = (db: BaseDeDatos, id: number) => obtenerInsumo(db, id)!.stock_actual;
const vigentes = (db: BaseDeDatos, id: number) => alertasDeInsumo(db, id).filter((a) => a.estado === 'Vigente').length;
const reposiciones = (db: BaseDeDatos) => cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Reposición'");

/** El Administrador registra un ingreso: «Registrar ingreso (insumo, cantidad recibida)» (DSS-03). */
function registrarIngreso(app: Parameters<typeof request>[0], insumoId: number | string, cantidad: string) {
  return request(app).post('/ingresos').type('form').send({ insumoId: String(insumoId), cantidad });
}

describe('HU-05 · Registrar el ingreso de un insumo comprado (CA1–CA3)', () => {
  it('HU-05 · Ingreso de un insumo comprado', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el stock de mantequilla es de 500 g
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 500, 100);
    const antes = reposiciones(db);
    // Cuando el administrador registra el ingreso de 1000 g de mantequilla
    const res = await registrarIngreso(app, mantequilla, '1000').redirects(1);
    // Entonces el stock de mantequilla queda en 1500 g
    expect(stock(db, mantequilla)).toBe(1500);
    expect(res.text).toContain('Ingreso registrado (stock actualizado: 1500 g)');
    // Y queda registrada una Reposición con su fecha, 1000 g de cantidad y el administrador como responsable
    expect(reposiciones(db)).toBe(antes + 1);
    const [reposicion] = listarReposiciones(db);
    expect(reposicion).toMatchObject({ insumo_nombre: 'mantequilla', cantidad: 1000, responsable: 'Administrador' });
    expect(Number.isNaN(Date.parse(reposicion!.fecha))).toBe(false);
  });

  it('HU-05 · Ver la reposición en la lista', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 0, 100);
    await registrarIngreso(app, mantequilla, '1000');
    const res = await request(app).get('/ingresos');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<td>mantequilla<\/td>\s*<td>1000 g<\/td>\s*<td>Administrador<\/td>/);
  });
});

describe('HU-05 · Resolver la alerta al superar el mínimo (CA4, EST-01 / EST-02)', () => {
  it('HU-05 · El ingreso levanta una alerta vigente', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que existe una alerta vigente para la mantequilla, con un stock de 500 g y un nivel mínimo de 500 g
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 500, 500);
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Stock crítico');
    expect(vigentes(db, mantequilla)).toBe(1);
    // Cuando el administrador registra el ingreso de 1000 g de mantequilla
    await registrarIngreso(app, mantequilla, '1000');
    // Entonces la alerta de la mantequilla deja de estar vigente (Vigente --Registrar ingreso--> Resuelta)
    expect(vigentes(db, mantequilla)).toBe(0);
    expect(alertasDeInsumo(db, mantequilla).at(-1)!.estado).toBe('Resuelta');
    // Stock crítico --Registrar ingreso [stock resultante > mínimo]--> Stock suficiente
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Stock suficiente');
  });

  it('HU-05 · El ingreso no alcanza a superar el mínimo', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 200, 500);
    await registrarIngreso(app, mantequilla, '100');
    expect(stock(db, mantequilla)).toBe(300);
    expect(vigentes(db, mantequilla)).toBe(1);
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Stock crítico');
  });
});

describe('HU-05 · Rechazar un ingreso inválido (DSS-03, decisiones D2 y D3)', () => {
  it('HU-05 · Ingreso sin indicar la cantidad recibida', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el stock de mantequilla es de 500 g
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 500, 100);
    const antes = reposiciones(db);
    // Cuando el administrador intenta registrar un ingreso de mantequilla sin indicar la cantidad recibida
    const res = await registrarIngreso(app, mantequilla, '');
    // Entonces el ingreso no se registra
    expect(res.status).toBe(400);
    expect(res.text).toContain('Ingreso rechazado (falta la cantidad)');
    expect(reposiciones(db)).toBe(antes);
    // Y el stock de mantequilla sigue en 500 g
    expect(stock(db, mantequilla)).toBe(500);
  });

  it('HU-05 · Cantidad no válida', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 500, 100);
    for (const cantidad of ['0', '-5', 'mucho']) {
      const res = await registrarIngreso(app, mantequilla, cantidad);
      expect(res.status).toBe(400);
      expect(res.text).toContain('Ingreso rechazado (la cantidad recibida debe ser mayor que 0)');
    }
    const sinInsumo = await registrarIngreso(app, '', '100');
    expect(sinInsumo.text).toContain('Ingreso rechazado (falta el insumo)');
    expect(stock(db, mantequilla)).toBe(500);
  });

  it('HU-05 · Insumo desactivado', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela está desactivada
    const canela = insumoConStock(db, 'canela', 'g', 100, 50);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: canela });
    const antes = reposiciones(db);
    // Cuando el administrador registra el ingreso de 500 g de canela
    const res = await registrarIngreso(app, canela, '500');
    // Entonces el sistema responde «Ingreso rechazado (insumo desactivado)» y el stock no cambia
    expect(res.status).toBe(400);
    expect(res.text).toContain('Ingreso rechazado (insumo desactivado)');
    expect(stock(db, canela)).toBe(100);
    expect(reposiciones(db)).toBe(antes);
    expect(estadoInsumo(obtenerInsumo(db, canela)!)).toBe('Desactivado');
  });
});

describe('HU-05 · Solo el administrador registra ingresos (RP-09)', () => {
  it('HU-05 · Otro rol intenta registrar un ingreso', async () => {
    const { db, app } = nuevoEntorno();
    const mantequilla = insumoConStock(db, 'mantequilla', 'g', 500, 100);
    const agente = request.agent(app);
    // Dado que el rol de demostración es Caja
    await agente.post('/rol').type('form').send({ rol: 'Caja', volver: '/ingresos' });
    // Cuando intenta registrar el ingreso de 1000 g de mantequilla
    const res = await agente.post('/ingresos').type('form').send({ insumoId: String(mantequilla), cantidad: '1000' });
    // Entonces el sistema responde «Acceso solo para el administrador» y el stock no cambia
    expect(res.status).toBe(403);
    expect(res.text).toContain('Acceso solo para el administrador');
    expect(stock(db, mantequilla)).toBe(500);
  });
});
