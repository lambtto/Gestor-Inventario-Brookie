// HU-06 · Especificación recetas-productos (CU-07; HU-06 CA2 y CA4)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadoProducto, dadaReceta, cuenta } from './ayuda.js';
import { aplicarEventoInsumo } from '../src/dominio/insumo.js';
import { cantidadPorUnidad, obtenerReceta } from '../src/dominio/receta.js';

describe('HU-06 · Definir receta de un producto (CU-07)', () => {
  it('HU-06 · Definir la receta de un producto', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que existe el producto Café Latte y el insumo leche
    const latte = dadoProducto(db, 'Café Latte');
    const leche = dadoInsumo(db, 'leche', 'ml');
    // Cuando el administrador define la receta del Café Latte con 250 ml de leche
    const res = await request(app)
      .post(`/recetas/${latte}`)
      .type('form')
      .send(`rendimiento=1&insumo=${leche}&cantidad=250&insumo=&cantidad=`)
      .redirects(1);
    expect(res.text).toContain('Receta guardada');
    // Entonces la receta del Café Latte queda con 250 ml de leche
    const receta = obtenerReceta(db, latte)!;
    expect(receta.ingredientes).toHaveLength(1);
    expect(receta.ingredientes[0]).toMatchObject({ insumo_nombre: 'leche', unidad_medida: 'ml', cantidad: 250 });
    expect(res.text).toContain('250 ml');
  });

  it('HU-06 · Receta sin ingredientes', async () => {
    const { db, app } = nuevoEntorno();
    const capuchino = dadoProducto(db, 'Capuchino');
    const res = await request(app)
      .post(`/recetas/${capuchino}`)
      .type('form')
      .send('rendimiento=1&insumo=&cantidad=&insumo=&cantidad=');
    expect(res.status).toBe(400);
    expect(res.text).toContain('Receta rechazada (debe tener al menos un ingrediente)');
    expect(obtenerReceta(db, capuchino)).toBeUndefined();
  });

  it('HU-06 · Cantidad inválida', async () => {
    const { db, app } = nuevoEntorno();
    const latte = dadoProducto(db, 'Café Latte');
    const leche = dadoInsumo(db, 'leche', 'ml');
    dadaReceta(db, latte, 1, [{ insumoId: leche, cantidad: 250 }]);
    const res = await request(app).post(`/recetas/${latte}`).type('form').send(`rendimiento=1&insumo=${leche}&cantidad=0`);
    expect(res.status).toBe(400);
    expect(res.text).toContain('Receta rechazada (las cantidades y el rendimiento deben ser mayores que 0)');
    // La receta existente no cambia
    expect(obtenerReceta(db, latte)!.ingredientes[0]!.cantidad).toBe(250);
  });

  it('HU-06 · Insumo repetido o rendimiento no entero se rechazan', async () => {
    const { db, app } = nuevoEntorno();
    const latte = dadoProducto(db, 'Café Latte');
    const leche = dadoInsumo(db, 'leche', 'ml');
    const repetido = await request(app)
      .post(`/recetas/${latte}`)
      .type('form')
      .send(`rendimiento=1&insumo=${leche}&cantidad=100&insumo=${leche}&cantidad=150`);
    expect(repetido.status).toBe(400);
    expect(repetido.text).toContain('Receta rechazada (un insumo no puede repetirse en la receta)');
    const decimal = await request(app).post(`/recetas/${latte}`).type('form').send(`rendimiento=1.5&insumo=${leche}&cantidad=100`);
    expect(decimal.status).toBe(400);
    expect(decimal.text).toContain('Receta rechazada (el rendimiento debe ser un número entero de unidades)');
    expect(obtenerReceta(db, latte)).toBeUndefined();
  });

  it('HU-06 · Insumo desactivado no se puede agregar', async () => {
    const { db, app } = nuevoEntorno();
    const producto = dadoProducto(db, 'SoHo');
    const canela = dadoInsumo(db, 'canela');
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: canela });
    const res = await request(app).post(`/recetas/${producto}`).type('form').send(`rendimiento=10&insumo=${canela}&cantidad=5`);
    expect(res.status).toBe(400);
    expect(res.text).toContain('Receta rechazada (el insumo canela está desactivado)');
    expect(obtenerReceta(db, producto)).toBeUndefined();
    // Y no se ofrece en el formulario
    const form = await request(app).get(`/recetas/${producto}`);
    expect(form.text).not.toContain(`<option value="${canela}"`);
  });

  it('HU-06 · Insumo desactivado ya presente se conserva', async () => {
    const { db, app } = nuevoEntorno();
    const lemon = dadoProducto(db, 'Lemon Empire');
    const mantequilla = dadoInsumo(db, 'mantequilla');
    const harina = dadoInsumo(db, 'harina con polvos');
    dadaReceta(db, lemon, 10, [
      { insumoId: mantequilla, cantidad: 250 },
      { insumoId: harina, cantidad: 400 },
    ]);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: mantequilla });
    // El formulario sigue mostrando la mantequilla como opción de su línea
    const form = await request(app).get(`/recetas/${lemon}`);
    expect(form.text).toContain(`<option value="${mantequilla}" selected>`);
    // Guardar cambiando solo la harina
    const res = await request(app)
      .post(`/recetas/${lemon}`)
      .type('form')
      .send(`rendimiento=10&insumo=${mantequilla}&cantidad=250&insumo=${harina}&cantidad=420`)
      .redirects(1);
    expect(res.text).toContain('Receta guardada');
    const receta = obtenerReceta(db, lemon)!;
    expect(receta.ingredientes.map((i) => [i.insumo_nombre, i.cantidad])).toEqual([
      ['mantequilla', 250],
      ['harina con polvos', 420],
    ]);
  });

  it('HU-06 · Cambiar una receta no altera los Descuentos anteriores', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la receta de Lemon Empire usa 250 g de mantequilla por tanda de 10 galletas
    const lemon = dadoProducto(db, 'Lemon Empire');
    const mantequilla = dadoInsumo(db, 'mantequilla');
    dadaReceta(db, lemon, 10, [{ insumoId: mantequilla, cantidad: 250 }]);
    // Y que ayer un pedido de 2 Lemon Empire registró un Descuento de 50 g de mantequilla
    const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const pedido = Number(
      db.prepare('INSERT INTO pedidos (numero, fecha_hora, monto_total) VALUES (1, ?, 7000)').run(ayer).lastInsertRowid,
    );
    db.prepare(
      "INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, pedido_id) VALUES ('Descuento', ?, ?, 50, ?)",
    ).run(mantequilla, ayer, pedido);
    // Cuando el administrador cambia la receta a 300 g de mantequilla por tanda
    const res = await request(app)
      .post(`/recetas/${lemon}`)
      .type('form')
      .send(`rendimiento=10&insumo=${mantequilla}&cantidad=300`)
      .redirects(1);
    expect(res.text).toContain('Receta guardada');
    // Entonces el Descuento de ayer sigue siendo de 50 g
    expect(cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Descuento' AND cantidad = 50")).toBe(1);
    // Y los pedidos posteriores descuentan 30 g de mantequilla por cada Lemon Empire
    const receta = obtenerReceta(db, lemon)!;
    expect(cantidadPorUnidad(receta.ingredientes[0]!.cantidad, receta.rendimiento)).toBe(30);
  });
});

describe('HU-06 · Ver productos y sus recetas', () => {
  it('HU-06 · Producto sin receta', async () => {
    const { db, app } = nuevoEntorno();
    dadoProducto(db, 'Banana Cloud');
    const res = await request(app).get('/recetas');
    expect(res.status).toBe(200);
    const fila = res.text.slice(res.text.indexOf('Banana Cloud'), res.text.indexOf('</tr>', res.text.indexOf('Banana Cloud')));
    expect(fila).toContain('Sin receta');
  });
});
