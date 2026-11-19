// HU-06 · Especificación acceso-por-rol (RP-09, supuesto S5)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadoProducto, dadaReceta, cuenta } from './ayuda.js';
import { obtenerReceta } from '../src/dominio/receta.js';

describe('HU-06 · Selector de rol y acceso', () => {
  it('HU-06 · Cambiar de rol', async () => {
    const { app } = nuevoEntorno();
    const agente = request.agent(app);
    // Dado que el rol actual es Administrador (por defecto)
    const antes = await agente.get('/insumos');
    expect(antes.text).toContain('<option value="Administrador" selected>');
    // Cuando la persona elige el rol Barista en el selector
    const cambio = await agente.post('/rol').type('form').send({ rol: 'Barista', volver: '/insumos' });
    expect(cambio.status).toBe(303);
    // Entonces las páginas siguientes se muestran con el rol Barista
    const despues = await agente.get('/insumos');
    expect(despues.text).toContain('<option value="Barista" selected>');
  });

  it('HU-06 · Barista intenta registrar un insumo', async () => {
    const { db, app } = nuevoEntorno();
    const ver = await request(app).get('/insumos').set('Cookie', 'rol=Barista');
    expect(ver.status).toBe(403);
    expect(ver.text).toContain('Acceso solo para el administrador');
    const registrar = await request(app)
      .post('/insumos')
      .set('Cookie', 'rol=Barista')
      .type('form')
      .send({ nombre: 'azúcar rubia', unidadMedida: 'g', costoUnitario: '2', stockMinimo: '500' });
    expect(registrar.status).toBe(403);
    expect(registrar.text).toContain('Acceso solo para el administrador');
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM insumos')).toBe(0);
  });

  it('HU-06 · Caja intenta definir una receta', async () => {
    const { db, app } = nuevoEntorno();
    const latte = dadoProducto(db, 'Café Latte');
    const leche = dadoInsumo(db, 'leche', 'ml');
    dadaReceta(db, latte, 1, [{ insumoId: leche, cantidad: 250 }]);
    const res = await request(app)
      .post(`/recetas/${latte}`)
      .set('Cookie', 'rol=Caja')
      .type('form')
      .send(`rendimiento=1&insumo=${leche}&cantidad=999`);
    expect(res.status).toBe(403);
    expect(res.text).toContain('Acceso solo para el administrador');
    expect(obtenerReceta(db, latte)!.ingredientes[0]!.cantidad).toBe(250);
  });
});
