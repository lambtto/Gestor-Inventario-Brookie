// Ajuste HU-06 (cambio ajuste-hu-06-editar-reactivar-validaciones) · Especificación gestion-insumos
// CA5 Editar (CU-09), CA6 Reactivar (CU-10), CA7 Validar nombre y costo, CA8 Ventana emergente. EST-01 / EST-02.
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadaReposicion, cuenta } from './ayuda.js';
import { aplicarEventoInsumo, alertasDeInsumo, estadoInsumo, obtenerInsumo, obtenerInsumoPorNombre } from '../src/dominio/insumo.js';
import { formatoCLP, leerPesos } from '../src/servicios/insumos.js';

const vigentes = (db: Parameters<typeof alertasDeInsumo>[0], id: number) =>
  alertasDeInsumo(db, id).filter((a) => a.estado === 'Vigente').length;

/** Deja un insumo con stock y sin alerta vigente (como la canela de los datos de ejemplo). */
function conStock(db: Parameters<typeof dadaReposicion>[0], id: number, cantidad: number): void {
  dadaReposicion(db, id, cantidad);
  db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ? AND estado = 'Vigente'").run(id);
}

describe('Ajuste HU-06 · Validar datos del insumo (CA7)', () => {
  it('HU-06 · Registrar un insumo con un nombre sin letras', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el administrador está registrando un insumo
    // Cuando intenta registrar el insumo «123» con unidad g, costo $2 CLP y mínimo 100 g
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: '123', unidadMedida: 'g', costoUnitario: '2', stockMinimo: '100' });
    // Entonces el insumo no queda registrado
    expect(res.status).toBe(400);
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM insumos')).toBe(0);
    // Y el sistema indica que el nombre debe contener al menos una letra
    expect(res.text).toContain('Registro rechazado (el nombre debe contener al menos una letra)');
  });

  it('acepta nombres con letras y dígitos (por ejemplo «Leche 2%»)', async () => {
    const { db, app } = nuevoEntorno();
    await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'Leche 2%', unidadMedida: 'ml', costoUnitario: '1', stockMinimo: '100' });
    expect(obtenerInsumoPorNombre(db, 'Leche 2%')).toBeDefined();
  });

  it('HU-06 · Registrar un insumo con costo en decimales', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el insumo azúcar flor no está registrado
    expect(obtenerInsumoPorNombre(db, 'azúcar flor')).toBeUndefined();
    // Cuando el administrador intenta registrarlo con un costo unitario de $2,5 CLP por gramo
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'azúcar flor', unidadMedida: 'g', costoUnitario: '2,5', stockMinimo: '100' });
    // Entonces el insumo no queda registrado
    expect(res.status).toBe(400);
    expect(obtenerInsumoPorNombre(db, 'azúcar flor')).toBeUndefined();
    // Y el sistema indica que el costo debe ser un número entero de pesos
    expect(res.text).toContain(
      'Registro rechazado (el costo unitario debe ser un número entero de pesos, CLP, mayor o igual a 0)',
    );
  });

  it('lectura de pesos: «1.250» es 1250; «2.5», «2,5» y «-1» no son enteros válidos', () => {
    expect(leerPesos('1250')).toBe(1250);
    expect(leerPesos('1.250')).toBe(1250);
    expect(leerPesos('0')).toBe(0);
    for (const v of ['2.5', '2,5', '-1', '1.25', 'abc']) expect(leerPesos(v)).toBeNaN();
  });

  it('HU-06 · Stock mínimo negativo', async () => {
    const { db, app } = nuevoEntorno();
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: 'maicena', unidadMedida: 'g', costoUnitario: '3', stockMinimo: '-5' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Registro rechazado (el stock mínimo debe ser un número mayor o igual a 0)');
    expect(cuenta(db, 'SELECT COUNT(*) AS n FROM insumos')).toBe(0);
  });
});

describe('Ajuste HU-06 · Listar insumos en CLP', () => {
  it('HU-06 · Costo en formato CLP', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que existe el insumo vainilla con costo unitario 1250
    dadoInsumo(db, 'vainilla', 'cucharadita', 5, 1250);
    // Cuando el administrador abre la pantalla «Insumos»
    const res = await request(app).get('/insumos');
    // Entonces el costo de la vainilla se muestra como «$1.250»
    expect(res.text).toContain('<td>$1.250</td>');
  });

  it('formato CLP: punto de miles y sin decimales', () => {
    expect(formatoCLP(0)).toBe('$0');
    expect(formatoCLP(12)).toBe('$12');
    expect(formatoCLP(1250)).toBe('$1.250');
    expect(formatoCLP(1234567)).toBe('$1.234.567');
  });
});

describe('Ajuste HU-06 · Editar insumo (CA5, CU-09)', () => {
  it('HU-06 · Editar el costo de un insumo', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la mantequilla tiene un costo unitario de $12 CLP por gramo
    const id = dadoInsumo(db, 'mantequilla', 'g', 1000, 12);
    // Cuando el administrador edita la mantequilla y cambia su costo unitario a $15 CLP por gramo
    const res = await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'mantequilla', unidadMedida: 'g', costoUnitario: '15', stockMinimo: '1000' })
      .redirects(1);
    // Entonces la mantequilla queda con un costo unitario de $15 CLP por gramo
    expect(obtenerInsumo(db, id)!.costo_unitario).toBe(15);
    // Y el sistema responde «Insumo actualizado»
    expect(res.text).toContain('Insumo actualizado');
  });

  it('HU-06 · Editar con un nombre de otro insumo', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que existen los insumos leche y mantequilla
    dadoInsumo(db, 'leche', 'ml');
    const id = dadoInsumo(db, 'mantequilla');
    // Cuando el administrador edita la mantequilla y cambia su nombre a «LECHE»
    const res = await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'LECHE', unidadMedida: 'g', costoUnitario: '1', stockMinimo: '100' });
    // Entonces la mantequilla conserva su nombre
    expect(obtenerInsumo(db, id)!.nombre).toBe('mantequilla');
    // Y el sistema responde «Edición rechazada (ya existe un insumo con ese nombre)»
    expect(res.status).toBe(400);
    expect(res.text).toContain('Edición rechazada (ya existe un insumo con ese nombre)');
  });

  it('editar conservando el propio nombre no se considera repetido', async () => {
    const { db, app } = nuevoEntorno();
    const id = dadoInsumo(db, 'mantequilla');
    const res = await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'Mantequilla', unidadMedida: 'kg', costoUnitario: '12000', stockMinimo: '1' });
    expect(res.status).toBe(303);
    expect(obtenerInsumo(db, id)).toMatchObject({ nombre: 'Mantequilla', unidad_medida: 'kg', costo_unitario: 12000 });
  });

  it('HU-06 · Editar un insumo desactivado', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela está desactivada
    const id = dadoInsumo(db, 'canela', 'g', 100, 20);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    // Cuando el administrador edita la canela y cambia su costo unitario a $25 CLP (y un mínimo mayor)
    await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'canela', unidadMedida: 'g', costoUnitario: '25', stockMinimo: '900' });
    // Entonces la canela queda con un costo unitario de $25 CLP
    const canela = obtenerInsumo(db, id)!;
    expect(canela.costo_unitario).toBe(25);
    // Y sigue desactivada y sin alerta vigente
    expect(estadoInsumo(canela)).toBe('Desactivado');
    expect(vigentes(db, id)).toBe(0);
  });

  it('una edición rechazada no cambia nada', async () => {
    const { db, app } = nuevoEntorno();
    const id = dadoInsumo(db, 'sal', 'g', 20, 1);
    const res = await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'sal', unidadMedida: 'g', costoUnitario: '0,5', stockMinimo: '20' });
    expect(res.status).toBe(400);
    expect(res.text).toContain('Edición rechazada (el costo unitario debe ser un número entero de pesos, CLP, mayor o igual a 0)');
    expect(obtenerInsumo(db, id)!.costo_unitario).toBe(1);
  });
});

describe('Ajuste HU-06 · Recalcular alerta al editar el stock mínimo (EST-01 / EST-02)', () => {
  it('HU-06 · Subir el stock mínimo sobre el stock actual', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela tiene 500 g de stock, un stock mínimo de 100 g y ninguna alerta vigente
    const id = dadoInsumo(db, 'canela', 'g', 100, 20);
    conStock(db, id, 500);
    expect(vigentes(db, id)).toBe(0);
    // Cuando el administrador edita la canela y cambia su stock mínimo a 600 g
    await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'canela', unidadMedida: 'g', costoUnitario: '20', stockMinimo: '600' });
    // Entonces la canela queda con un stock mínimo de 600 g
    const canela = obtenerInsumo(db, id)!;
    expect(canela.stock_minimo).toBe(600);
    // Y tiene una alerta de stock crítico vigente
    expect(estadoInsumo(canela)).toBe('Stock crítico');
    expect(vigentes(db, id)).toBe(1);
  });

  it('HU-06 · Bajar el stock mínimo bajo el stock actual', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela tiene 500 g de stock, un stock mínimo de 600 g y una alerta vigente
    const id = dadoInsumo(db, 'canela', 'g', 600, 20);
    dadaReposicion(db, id, 500);
    expect(vigentes(db, id)).toBe(1);
    // Cuando el administrador edita la canela y cambia su stock mínimo a 100 g
    await request(app)
      .post(`/insumos/${id}/editar`)
      .type('form')
      .send({ nombre: 'canela', unidadMedida: 'g', costoUnitario: '20', stockMinimo: '100' });
    // Entonces la canela queda en «Stock suficiente»
    expect(estadoInsumo(obtenerInsumo(db, id)!)).toBe('Stock suficiente');
    // Y su alerta deja de estar vigente
    expect(alertasDeInsumo(db, id).map((a) => a.estado)).toEqual(['Resuelta']);
  });

  it('una edición que deja el insumo en Stock crítico con alerta vigente no duplica la alerta', () => {
    const { db } = nuevoEntorno();
    const id = dadoInsumo(db, 'leche', 'ml', 1000, 1);
    aplicarEventoInsumo(db, {
      tipo: 'editar',
      insumoId: id,
      datos: { nombre: 'leche', unidadMedida: 'ml', costoUnitario: 2, stockMinimo: 2000 },
    });
    expect(alertasDeInsumo(db, id)).toHaveLength(1);
  });
});

describe('Ajuste HU-06 · Reactivar insumo (CA6, CU-10)', () => {
  it('HU-06 · Reactivar un insumo desactivado con stock crítico', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la mantequilla está desactivada, con 0 g de stock y un stock mínimo de 500 g
    const id = dadoInsumo(db, 'mantequilla', 'g', 500, 12);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    expect(vigentes(db, id)).toBe(0);
    // Cuando el administrador reactiva la mantequilla
    const res = await request(app).post(`/insumos/${id}/reactivar`).redirects(1);
    // Entonces la mantequilla queda activa
    const mantequilla = obtenerInsumo(db, id)!;
    expect(mantequilla.activo).toBe(1);
    expect(estadoInsumo(mantequilla)).toBe('Stock crítico');
    // Y tiene una alerta de stock crítico vigente nueva
    expect(alertasDeInsumo(db, id).map((a) => a.estado)).toEqual(['Resuelta', 'Vigente']);
    // Y el sistema responde «Insumo reactivado»
    expect(res.text).toContain('Insumo reactivado');
  });

  it('HU-06 · Reactivar un insumo con stock suficiente', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela está desactivada, con 500 g de stock y un stock mínimo de 100 g
    const id = dadoInsumo(db, 'canela', 'g', 100, 20);
    conStock(db, id, 500);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    // Cuando el administrador reactiva la canela
    await request(app).post(`/insumos/${id}/reactivar`);
    // Entonces la canela queda en «Stock suficiente»
    expect(estadoInsumo(obtenerInsumo(db, id)!)).toBe('Stock suficiente');
    // Y no tiene alerta vigente
    expect(vigentes(db, id)).toBe(0);
  });

  it('reactivar un insumo activo se rechaza', async () => {
    const { db, app } = nuevoEntorno();
    const id = dadoInsumo(db, 'sal');
    const res = await request(app).post(`/insumos/${id}/reactivar`);
    expect(res.status).toBe(400);
    expect(res.text).toContain('El insumo ya está activo');
  });

  it('un insumo reactivado vuelve a poder elegirse en recetas nuevas', async () => {
    const { db, app } = nuevoEntorno();
    db.prepare("INSERT INTO productos (nombre) VALUES ('Café Latte')").run();
    const id = dadoInsumo(db, 'leche', 'ml');
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: id });
    aplicarEventoInsumo(db, { tipo: 'reactivar', insumoId: id });
    const producto = (db.prepare("SELECT id FROM productos WHERE nombre = 'Café Latte'").get() as { id: number }).id;
    const res = await request(app).get(`/recetas/${producto}`);
    expect(res.text).toContain('leche');
  });
});

describe('Ajuste HU-06 · Formulario de insumo en ventana emergente (CA8)', () => {
  it('HU-06 · El formulario de insumo se abre en una ventana emergente', async () => {
    const { app } = nuevoEntorno();
    // Dado que el administrador está en la lista de insumos
    const res = await request(app).get('/insumos');
    // Cuando elige registrar un insumo: el botón abre la ventana modal (showModal centra el <dialog> sobre la lista)
    expect(res.text).toContain('id="abrir-registro"');
    expect(res.text).toMatch(/<dialog id="ventana-insumo" class="ventana"[^>]*>/);
    expect(res.text).toContain('ventana.showModal()');
    // Entonces el formulario está dentro de la ventana y la pantalla no cambia (la ventana empieza cerrada)
    const dialogo = res.text.slice(res.text.indexOf('<dialog'), res.text.indexOf('</dialog>'));
    expect(dialogo).toContain('action="/insumos"');
    expect(dialogo).toContain('name="costoUnitario"');
    expect(res.text).not.toMatch(/<dialog[^>]*\bopen\b/);
  });

  it('HU-06 · La ventana se reabre con el motivo del rechazo', async () => {
    const { app } = nuevoEntorno();
    // Cuando el administrador intenta registrar el insumo «123»
    const res = await request(app)
      .post('/insumos')
      .type('form')
      .send({ nombre: '123', unidadMedida: 'g', costoUnitario: '2', stockMinimo: '100' });
    // Entonces la pantalla «Insumos» se muestra con la ventana de registro abierta
    expect(res.text).toMatch(/<dialog id="ventana-insumo"[^>]*data-abrir open/);
    const dialogo = res.text.slice(res.text.indexOf('<dialog'), res.text.indexOf('</dialog>'));
    // Y la ventana muestra el motivo y el nombre «123» escrito
    expect(dialogo).toContain('Registro rechazado (el nombre debe contener al menos una letra)');
    expect(dialogo).toContain('name="nombre" value="123"');
  });

  it('cada insumo tiene su botón «Editar» con sus datos para la ventana', async () => {
    const { db, app } = nuevoEntorno();
    const id = dadoInsumo(db, 'vainilla', 'cucharadita', 5, 150);
    const res = await request(app).get('/insumos');
    expect(res.text).toContain(`data-id="${id}" data-nombre="vainilla" data-unidad="cucharadita"`);
    expect(res.text).toContain('data-costo="150" data-minimo="5"');
  });
});

describe('Ajuste HU-06 · Acceso (RP-09)', () => {
  it('Barista no puede editar ni reactivar insumos', async () => {
    const { db, app } = nuevoEntorno();
    const id = dadoInsumo(db, 'sal');
    for (const ruta of [`/insumos/${id}/editar`, `/insumos/${id}/reactivar`]) {
      const res = await request(app).post(ruta).set('Cookie', 'rol=Barista').type('form').send({ nombre: 'x' });
      expect(res.status).toBe(403);
      expect(res.text).toContain('Acceso solo para el administrador');
    }
    expect(obtenerInsumo(db, id)!.nombre).toBe('sal');
  });
});
