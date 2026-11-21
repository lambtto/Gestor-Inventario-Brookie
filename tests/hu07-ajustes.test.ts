// HU-07 · Especificación ajuste-stock (CU-11, DSS-06; EST-01 / EST-02; RP-14, RP-08, RP-09)
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { nuevoEntorno, dadoInsumo, dadaReposicion, cuenta } from './ayuda.js';
import { abrirBase, aplicarMigraciones, type BaseDeDatos } from '../src/db/conexion.js';
import { cargarDatosDeEjemplo } from '../src/db/seed.js';
import { aplicarEventoInsumo, alertasDeInsumo, estadoInsumo, obtenerInsumo, obtenerInsumoPorNombre } from '../src/dominio/insumo.js';
import { listarAjustes } from '../src/servicios/ajustes.js';

/** Insumo con stock dado; la alerta queda Vigente solo si el stock está en o bajo el mínimo (como lo dejaría EST-02). */
function insumoConStock(db: BaseDeDatos, nombre: string, unidad: string, stock: number, minimo: number): number {
  const id = dadoInsumo(db, nombre, unidad, minimo);
  if (stock > 0) dadaReposicion(db, id, stock);
  if (stock > minimo) db.prepare("UPDATE alertas_stock SET estado = 'Resuelta' WHERE insumo_id = ?").run(id);
  return id;
}

const vigentes = (db: BaseDeDatos, id: number) => alertasDeInsumo(db, id).filter((a) => a.estado === 'Vigente').length;
const ajustes = (db: BaseDeDatos) => cuenta(db, "SELECT COUNT(*) AS n FROM movimientos_inventario WHERE tipo = 'Ajuste'");

function ajustar(app: Parameters<typeof request>[0], insumoId: number | string, motivo: string, cantidad: string) {
  return request(app).post('/ajustes').type('form').send({ insumoId: String(insumoId), motivo, cantidad });
}

describe('HU-07 · Registrar merma (CA1)', () => {
  it('HU-07 · Registrar una merma', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la leche tiene 2000 ml de stock y un stock mínimo de 500 ml
    const leche = insumoConStock(db, 'leche', 'ml', 2000, 500);
    // Cuando el administrador registra un ajuste de la leche con motivo «Merma» por 300 ml
    const res = await ajustar(app, leche, 'Merma', '300').redirects(1);
    // Entonces el stock de la leche queda en 1700 ml
    expect(obtenerInsumo(db, leche)!.stock_actual).toBe(1700);
    // Y queda registrado un ajuste de -300 ml con motivo «Merma», la fecha y el administrador como responsable
    const [ajuste] = listarAjustes(db);
    expect(ajuste).toMatchObject({ insumo_nombre: 'leche', cantidad: -300, motivo: 'Merma', responsable: 'Administrador' });
    expect(Number.isNaN(Date.parse(ajuste!.fecha))).toBe(false);
    // Y el sistema responde «Ajuste registrado (stock actualizado: 1700 ml)»
    expect(res.text).toContain('Ajuste registrado (stock actualizado: 1700 ml)');
  });
});

describe('HU-07 · Corregir conteo (CA2)', () => {
  it('HU-07 · Corregir el conteo hacia arriba', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la harina tiene 1000 g de stock en el sistema
    const harina = insumoConStock(db, 'harina', 'g', 1000, 500);
    // Cuando registra una «Corrección de conteo» con 1200 g contados
    await ajustar(app, harina, 'Corrección de conteo', '1200');
    // Entonces el stock de la harina queda en 1200 g
    expect(obtenerInsumo(db, harina)!.stock_actual).toBe(1200);
    // Y queda registrado un ajuste de +200 g con motivo «Corrección de conteo»
    expect(listarAjustes(db)[0]).toMatchObject({ cantidad: 200, motivo: 'Corrección de conteo' });
  });

  it('HU-07 · Corregir el conteo hacia abajo', async () => {
    const { db, app } = nuevoEntorno();
    const harina = insumoConStock(db, 'harina', 'g', 1000, 500);
    await ajustar(app, harina, 'Corrección de conteo', '950');
    expect(obtenerInsumo(db, harina)!.stock_actual).toBe(950);
    expect(listarAjustes(db)[0]).toMatchObject({ cantidad: -50, motivo: 'Corrección de conteo' });
  });

  it('HU-07 · Corrección igual al stock actual', async () => {
    const { db, app } = nuevoEntorno();
    const harina = insumoConStock(db, 'harina', 'g', 1000, 500);
    const res = await ajustar(app, harina, 'Corrección de conteo', '1000');
    expect(res.status).toBe(303);
    expect(obtenerInsumo(db, harina)!.stock_actual).toBe(1000);
    expect(listarAjustes(db)[0]).toMatchObject({ cantidad: 0, motivo: 'Corrección de conteo' });
  });

  it('acepta cantidades con decimales y coma (0,5 cucharadita)', async () => {
    const { db, app } = nuevoEntorno();
    const vainilla = insumoConStock(db, 'vainilla', 'cucharadita', 3, 1);
    await ajustar(app, vainilla, 'Merma', '0,5');
    expect(obtenerInsumo(db, vainilla)!.stock_actual).toBe(2.5);
  });
});

describe('HU-07 · Registrar el movimiento de ajuste (CA3)', () => {
  it('HU-07 · Ver el ajuste en la lista', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que el administrador registró una merma de 300 ml de leche
    const leche = insumoConStock(db, 'leche', 'ml', 2000, 500);
    await ajustar(app, leche, 'Merma', '300');
    // Cuando abre la pantalla «Ajustar stock»
    const res = await request(app).get('/ajustes');
    // Entonces ve en la lista la leche con motivo «Merma», cantidad «-300 ml» y responsable «Administrador»
    const tabla = res.text.slice(res.text.indexOf('Ajustes registrados'));
    expect(tabla).toContain('<td>leche</td>');
    expect(tabla).toContain('<td>Merma</td>');
    expect(tabla).toContain('<td>-300 ml</td>');
    expect(tabla).toContain('<td>Administrador</td>');
  });

  it('un insumo con ajustes registrados ya no se puede eliminar (tiene movimientos, HU-06 CA3)', async () => {
    const { db, app } = nuevoEntorno();
    const sal = insumoConStock(db, 'sal', 'g', 0, 20);
    await ajustar(app, sal, 'Corrección de conteo', '50');
    const res = await request(app).post(`/insumos/${sal}/eliminar`);
    expect(res.text).toContain('Eliminación rechazada (solo se puede desactivar)');
  });
});

describe('HU-07 · Stock no negativo (CA4)', () => {
  it('HU-07 · Una merma mayor que el stock se rechaza', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la leche tiene 200 ml de stock
    const leche = insumoConStock(db, 'leche', 'ml', 200, 500);
    // Cuando el administrador intenta registrar una merma de 300 ml de leche
    const res = await ajustar(app, leche, 'Merma', '300');
    // Entonces el ajuste no queda registrado
    expect(res.status).toBe(400);
    expect(ajustes(db)).toBe(0);
    // Y el stock de la leche sigue en 200 ml
    expect(obtenerInsumo(db, leche)!.stock_actual).toBe(200);
    expect(res.text).toContain('Ajuste rechazado (la cantidad supera el stock)');
  });

  it('HU-07 · Merma de cero', async () => {
    const { db, app } = nuevoEntorno();
    const leche = insumoConStock(db, 'leche', 'ml', 200, 500);
    const res = await ajustar(app, leche, 'Merma', '0');
    expect(res.status).toBe(400);
    expect(ajustes(db)).toBe(0);
    expect(res.text).toContain('Ajuste rechazado (la cantidad perdida debe ser mayor que 0)');
  });

  it('HU-07 · Cantidad contada negativa', async () => {
    const { db, app } = nuevoEntorno();
    const harina = insumoConStock(db, 'harina', 'g', 100, 500);
    const res = await ajustar(app, harina, 'Corrección de conteo', '-10');
    expect(res.status).toBe(400);
    expect(ajustes(db)).toBe(0);
    expect(res.text).toContain('Ajuste rechazado (la cantidad contada no puede ser negativa)');
  });

  it('HU-07 · Ajuste sin cantidad', async () => {
    const { db, app } = nuevoEntorno();
    const leche = insumoConStock(db, 'leche', 'ml', 200, 500);
    for (const cantidad of ['', 'mucho']) {
      const res = await ajustar(app, leche, 'Merma', cantidad);
      expect(res.status).toBe(400);
      expect(res.text).toContain('Ajuste rechazado (dato faltante)');
    }
    const sinInsumo = await ajustar(app, '', 'Merma', '10');
    expect(sinInsumo.text).toContain('Ajuste rechazado (dato faltante)');
    const motivoInvalido = await ajustar(app, leche, 'Robo', '10');
    expect(motivoInvalido.text).toContain('Ajuste rechazado (dato faltante)');
    expect(ajustes(db)).toBe(0);
  });

  it('ante un rechazo, el formulario conserva lo escrito', async () => {
    const { db, app } = nuevoEntorno();
    const leche = insumoConStock(db, 'leche', 'ml', 200, 500);
    const res = await ajustar(app, leche, 'Merma', '300');
    expect(res.text).toMatch(new RegExp(`<option value="${leche}" selected>`));
    expect(res.text).toContain('name="cantidad" inputmode="decimal" size="8" value="300"');
  });
});

describe('HU-07 · Actualizar alerta con el ajuste (CA5, EST-01 / EST-02)', () => {
  it('HU-07 · Una merma deja el insumo en stock crítico', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la leche tiene 600 ml de stock, un stock mínimo de 500 ml y ninguna alerta vigente
    const leche = insumoConStock(db, 'leche', 'ml', 600, 500);
    expect(vigentes(db, leche)).toBe(0);
    // Cuando el administrador registra una merma de 200 ml de leche
    await ajustar(app, leche, 'Merma', '200');
    // Entonces el stock de la leche queda en 400 ml
    const insumo = obtenerInsumo(db, leche)!;
    expect(insumo.stock_actual).toBe(400);
    // Y la leche tiene una alerta de stock crítico vigente
    expect(estadoInsumo(insumo)).toBe('Stock crítico');
    expect(vigentes(db, leche)).toBe(1);
  });

  it('HU-07 · Una corrección de conteo resuelve la alerta', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la harina tiene 100 g de stock, un stock mínimo de 500 g y una alerta vigente
    const harina = insumoConStock(db, 'harina', 'g', 100, 500);
    expect(vigentes(db, harina)).toBe(1);
    // Cuando el administrador registra una corrección de conteo de la harina con 800 g contados
    await ajustar(app, harina, 'Corrección de conteo', '800');
    // Entonces el stock de la harina queda en 800 g
    const insumo = obtenerInsumo(db, harina)!;
    expect(insumo.stock_actual).toBe(800);
    // Y su alerta deja de estar vigente
    expect(estadoInsumo(insumo)).toBe('Stock suficiente');
    expect(alertasDeInsumo(db, harina).map((a) => a.estado)).toEqual(['Resuelta']);
  });

  it('HU-07 · Ajustar un insumo desactivado', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la canela está desactivada, con 500 g de stock y un stock mínimo de 100 g
    const canela = insumoConStock(db, 'canela', 'g', 500, 100);
    aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId: canela });
    // Cuando el administrador registra una merma de 450 g de canela
    await ajustar(app, canela, 'Merma', '450');
    // Entonces el stock de la canela queda en 50 g
    const insumo = obtenerInsumo(db, canela)!;
    expect(insumo.stock_actual).toBe(50);
    // Y la canela sigue desactivada y sin alerta vigente
    expect(estadoInsumo(insumo)).toBe('Desactivado');
    expect(vigentes(db, canela)).toBe(0);
  });

  it('un ajuste en Stock crítico que no cruza el mínimo no duplica la alerta', () => {
    const { db } = nuevoEntorno();
    const leche = insumoConStock(db, 'leche', 'ml', 300, 500);
    aplicarEventoInsumo(db, { tipo: 'ajustar', insumoId: leche, motivo: 'Merma', cantidad: 100, responsable: 'Administrador' });
    expect(alertasDeInsumo(db, leche)).toHaveLength(1);
  });
});

describe('HU-07 · Pantalla «Ajustar stock» (D1, D2, RP-09)', () => {
  it('HU-07 · Ver el stock en el selector', async () => {
    const { db, app } = nuevoEntorno();
    // Dado que la leche tiene 2000 ml de stock
    const leche = insumoConStock(db, 'leche', 'ml', 2000, 500);
    // Cuando el administrador abre la pantalla «Ajustar stock»
    const res = await request(app).get('/ajustes');
    // Entonces el selector de insumos muestra «leche (2000 ml)»
    expect(res.text).toContain(`<option value="${leche}" >leche (2000 ml)</option>`);
    // Y el formulario ofrece los motivos «Merma» y «Corrección de conteo»
    expect(res.text).toContain('<option value="Merma"');
    expect(res.text).toContain('<option value="Corrección de conteo"');
    // Y el menú tiene el enlace «Ajustar stock»
    expect(res.text).toContain('<a href="/ajustes">Ajustar stock</a>');
  });

  it('HU-07 · Solo el administrador ajusta stock', async () => {
    const { db, app } = nuevoEntorno();
    const leche = insumoConStock(db, 'leche', 'ml', 2000, 500);
    // Dado que el rol de demostración seleccionado es Barista
    const ver = await request(app).get('/ajustes').set('Cookie', 'rol=Barista');
    const registrar = await ajustar(app, leche, 'Merma', '300').set('Cookie', 'rol=Barista');
    // Entonces el sistema responde «Acceso solo para el administrador»
    for (const res of [ver, registrar]) {
      expect(res.status).toBe(403);
      expect(res.text).toContain('Acceso solo para el administrador');
    }
    // Y no se registra ningún ajuste
    expect(ajustes(db)).toBe(0);
    expect(obtenerInsumo(db, leche)!.stock_actual).toBe(2000);
  });
});

describe('HU-07 · Migración 004 (tabla de movimientos con Ajuste)', () => {
  it('conserva los movimientos existentes y exige motivo solo en los Ajustes', () => {
    const db = abrirBase();
    cargarDatosDeEjemplo(db);
    const canela = obtenerInsumoPorNombre(db, 'canela')!;
    // Reaplica la 004 sobre una base con datos (simula una base anterior a la HU-07)
    db.prepare('DELETE FROM schema_migrations WHERE nombre LIKE ?').run('004_%');
    aplicarMigraciones(db);
    const reposicion = db
      .prepare("SELECT tipo, cantidad, responsable, motivo FROM movimientos_inventario WHERE insumo_id = ?")
      .get(canela.id);
    expect(reposicion).toEqual({ tipo: 'Reposición', cantidad: 500, responsable: 'Administrador', motivo: null });
    const insertar = db.prepare(
      'INSERT INTO movimientos_inventario (tipo, insumo_id, fecha, cantidad, responsable, motivo) VALUES (?, ?, ?, ?, ?, ?)',
    );
    expect(() => insertar.run('Ajuste', canela.id, 'x', -10, 'Administrador', 'Merma')).not.toThrow();
    expect(() => insertar.run('Ajuste', canela.id, 'x', -10, 'Administrador', null)).toThrow();
    expect(() => insertar.run('Reposición', canela.id, 'x', 10, 'Administrador', 'Merma')).toThrow();
  });
});
