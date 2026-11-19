// HU-06 · Especificación gestion-insumos (CU-06, CU-08; EST-01, EST-02; DSS-04, DSS-05)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadoProducto, dadaReceta, dadaReposicion, cuenta } from './ayuda.js';
import {
  aplicarEventoInsumo,
  alertasDeInsumo,
  EliminacionRechazada,
  estadoInsumo,
  obtenerInsumo,
  obtenerInsumoPorNombre,
} from '../src/dominio/insumo.js';

describe('HU-06 · Ciclo de vida de Insumo (EST-01 / EST-02)', () => {
  it('registrar: nace en Stock crítico con stock 0 y alerta Vigente', () => {
    const { db } = nuevoEntorno();
    const id = dadoInsumo(db, 'harina con polvos');
    const insumo = obtenerInsumo(db, id)!;
    expect(insumo.stock_actual).toBe(0);
    expect(estadoInsumo(insumo)).toBe('Stock crítico');
    expect(alertasDeInsumo(db, id).map((a) => a.estado)).toEqual(['Vigente']);
  });

  it('estado derivado: Stock suficiente cuando el stock supera el mínimo', () => {
    expect(estadoInsumo({ activo: 1, stock_actual: 600, stock_minimo: 500 })).toBe('Stock suficiente');
    expect(estadoInsumo({ activo: 1, stock_actual: 500, stock_minimo: 500 })).toBe('Stock crítico');
    expect(estadoInsumo({ activo: 0, stock_actual: 600, stock_minimo: 500 })).toBe('Desactivado');
  });

  it('desactivar desde Stock suficiente: pasa a Desactivado sin alerta que resolver', () => {
    const { db } = nuevoEntorno();
    const id = dadoInsumo(db, 'sal', 'g', 10);
    dadaReposicion(db, id, 50);
    db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ?").run(id);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    expect(estadoInsumo(obtenerInsumo(db, id)!)).toBe('Desactivado');
  });

  it('desactivar un insumo ya desactivado es una transición no permitida', () => {
    const { db } = nuevoEntorno();
    const id = dadoInsumo(db, 'sal');
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    expect(() => aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id })).toThrow('ya está desactivado');
  });

  it('eliminar desde Desactivado cuando no tiene recetas ni movimientos', () => {
    const { db } = nuevoEntorno();
    const id = dadoInsumo(db, 'maicena');
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    aplicarEventoInsumo(db, { tipo: 'eliminar', insumoId: id });
    expect(obtenerInsumo(db, id)).toBeUndefined();
  });

  it('la guarda de eliminar rechaza un insumo en receta', () => {
    const { db } = nuevoEntorno();
    const id = dadoInsumo(db, 'mantequilla');
    dadaReceta(db, dadoProducto(db, 'Lemon Empire'), 10, [{ insumoId: id, cantidad: 250 }]);
    expect(() => aplicarEventoInsumo(db, { tipo: 'eliminar', insumoId: id })).toThrow(EliminacionRechazada);
  });
});

describe('HU-06 · Registrar insumo (CU-06, DSS-04)', () => {
  it('HU-06 · Registrar un insumo nuevo', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el insumo azúcar rubia no está registrado
    expect(obtenerInsumoPorNombre(db, 'azúcar rubia')).toBeUndefined();
    // Cuando el administrador registra el insumo azúcar rubia con unidad g, costo $2 CLP por gramo y mínimo 500 g
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'azúcar rubia', unidadMedida: 'g', costoUnitario: '2', stockMinimo: '500' })
      .redirects(1);
    expect(res.status).toBe(200);
    expect(res.text).toContain('Insumo registrado');
    // Entonces el insumo queda registrado con esos cuatro datos
    const insumo = obtenerInsumoPorNombre(db, 'azúcar rubia')!;
    expect(insumo).toMatchObject({ nombre: 'azúcar rubia', unidad_medida: 'g', costo_unitario: 2, stock_minimo: 500 });
    // Y su stock queda en 0 g con una alerta de stock crítico vigente
    expect(insumo.stock_actual).toBe(0);
    expect(estadoInsumo(insumo)).toBe('Stock crítico');
    expect(alertasDeInsumo(db, insumo.id).map((a) => a.estado)).toEqual(['Vigente']);
  });

  it('HU-06 · Alerta creada con el insumo', async () => {
    const { db, app } = nuevoEntorno();
    await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'cacao', unidadMedida: 'g', costoUnitario: '10', stockMinimo: '100' });
    const insumo = obtenerInsumoPorNombre(db, 'cacao')!;
    expect(cuenta(db, "SELECT COUNT(*) AS n FROM alertas_stock WHERE insumo_id = ? AND estado = 'Vigente'", insumo.id)).toBe(1);
  });

  it('HU-06 · Registrar un insumo sin unidad de medida', async () => {
    const { db, app } = nuevoEntorno();
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'azúcar rubia', unidadMedida: '', costoUnitario: '2', stockMinimo: '500' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Registro rechazado (dato faltante)');
    expect(obtenerInsumoPorNombre(db, 'azúcar rubia')).toBeUndefined();
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM alertas_stock')).toBe(0);
  });

  it('HU-06 · Nombre repetido', async () => {
    const { db, app } = nuevoEntorno();
    dadoInsumo(db, 'leche', 'ml');
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'Leche', unidadMedida: 'ml', costoUnitario: '1', stockMinimo: '1000' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Registro rechazado (ya existe un insumo con ese nombre)');
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM insumos')).toBe(1);
  });

  it('HU-06 · Costo negativo', async () => {
    const { db, app } = nuevoEntorno();
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'pistacho', unidadMedida: 'g', costoUnitario: '-1', stockMinimo: '100' });
    expect(res.status).toBe(400);
    expect(res.text).toContain(
      'Registro rechazado (el costo unitario debe ser un número entero de pesos, CLP, mayor o igual a 0)',
    );
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM insumos')).toBe(0);
  });

  it('HU-06 · Ver la lista de insumos', async () => {
    const { db, app } = nuevoEntorno();
    dadoInsumo(db, 'leche', 'ml', 1000, 1);
    const canela = dadoInsumo(db, 'canela', 'g', 50, 20);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: canela });
    const res = await request(app).get('/insumos');
    expect(res.status).toBe(200);
    const filaLeche = res.text.slice(res.text.indexOf('<td>leche</td>'), res.text.indexOf('</tr>', res.text.indexOf('<td>leche</td>')));
    const filaCanela = res.text.slice(res.text.indexOf('<td>canela</td>'), res.text.indexOf('</tr>', res.text.indexOf('<td>canela</td>')));
    expect(filaLeche).toContain('ml');
    expect(filaLeche).toContain('$1');
    expect(filaLeche).toContain('Desactivar');
    expect(filaLeche).toContain('1000 ml');
    expect(filaLeche).toContain('Activo');
    expect(filaCanela).toContain('Desactivado');
    expect(filaCanela).toContain('Reactivar');
  });
});

describe('HU-06 · Dar de baja un insumo (CU-08, DSS-05)', () => {
  it('HU-06 · Eliminar un insumo sin recetas ni movimientos', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el azúcar flor no está en recetas ni tiene movimientos, y tiene una alerta vigente
    const id = dadoInsumo(db, 'azúcar flor');
    expect(alertasDeInsumo(db, id)).toHaveLength(1);
    const res = await request(app).post(`/insumos/${id}/eliminar`).redirects(1);
    expect(res.text).toContain('Insumo eliminado');
    expect(obtenerInsumo(db, id)).toBeUndefined();
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM alertas_stock WHERE insumo_id = ?', id)).toBe(0);
  });

  it('HU-06 · Un insumo usado en una receta no se puede eliminar', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la mantequilla forma parte de la receta de Lemon Empire
    const mantequilla = dadoInsumo(db, 'mantequilla');
    dadaReceta(db, dadoProducto(db, 'Lemon Empire'), 10, [{ insumoId: mantequilla, cantidad: 250 }]);
    // Cuando el administrador intenta eliminar la mantequilla
    const res = await request(app).post(`/insumos/${mantequilla}/eliminar`);
    // Entonces la mantequilla no se elimina
    expect(res.status).toBe(409);
    expect(obtenerInsumo(db, mantequilla)).toBeDefined();
    // Y el administrador solo puede desactivarla
    expect(res.text).toContain('Eliminación rechazada (solo se puede desactivar)');
    expect(res.text).toContain(`action="/insumos/${mantequilla}/desactivar"`);
  });

  it('HU-06 · Un insumo con movimientos registrados no se puede eliminar', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela no forma parte de ninguna receta y tiene una Reposición de 500 g
    const canela = dadoInsumo(db, 'canela');
    dadaReposicion(db, canela, 500);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM ingredientes WHERE insumo_id = ?', canela)).toBe(0);
    // Cuando el administrador intenta eliminar la canela
    const res = await request(app).post(`/insumos/${canela}/eliminar`);
    // Entonces la canela no se elimina y solo puede desactivarla
    expect(res.status).toBe(409);
    expect(obtenerInsumo(db, canela)).toBeDefined();
    expect(res.text).toContain('Eliminación rechazada (solo se puede desactivar)');
    expect(res.text).toContain(`action="/insumos/${canela}/desactivar"`);
  });

  it('HU-06 · Desactivar un insumo con alerta vigente', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la mantequilla tiene una alerta vigente
    const mantequilla = dadoInsumo(db, 'mantequilla');
    expect(alertasDeInsumo(db, mantequilla).map((a) => a.estado)).toEqual(['Vigente']);
    // Cuando el administrador desactiva la mantequilla
    const res = await request(app).post(`/insumos/${mantequilla}/desactivar`).redirects(1);
    expect(res.text).toContain('Insumo desactivado');
    // Entonces la mantequilla queda desactivada y su alerta deja de estar vigente
    expect(estadoInsumo(obtenerInsumo(db, mantequilla)!)).toBe('Desactivado');
    expect(alertasDeInsumo(db, mantequilla).map((a) => a.estado)).toEqual(['Resuelta']);
  });
});
