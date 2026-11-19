// Caso de uso CU-07 Definir receta de un producto (HU-06 CA2 y CA4). Flujo reconstruido desde el Gherkin.
import type { BaseDeDatos } from '../db/conexion.js';
import { ErrorDeNegocio, obtenerInsumo } from '../dominio/insumo.js';
import { obtenerProducto, obtenerReceta, reemplazarReceta, type LineaReceta } from '../dominio/receta.js';
import { leerNumero } from './insumos.js';

export const MENSAJES_RECETA = {
  guardada: 'Receta guardada',
  sinIngredientes: 'Receta rechazada (debe tener al menos un ingrediente)',
  valoresInvalidos: 'Receta rechazada (las cantidades y el rendimiento deben ser mayores que 0)',
  rendimientoEntero: 'Receta rechazada (el rendimiento debe ser un número entero de unidades)',
  lineaSinInsumo: 'Receta rechazada (cada línea con cantidad debe indicar su insumo)',
  insumoRepetido: 'Receta rechazada (un insumo no puede repetirse en la receta)',
  insumoDesactivado: (nombre: string) => `Receta rechazada (el insumo ${nombre} está desactivado)`,
} as const;

/** Línea tal como llega del formulario. Las líneas totalmente vacías se ignoran. */
export interface LineaFormulario {
  insumoId?: string;
  cantidad?: string;
}

export interface FormularioReceta {
  rendimiento?: string;
  lineas: LineaFormulario[];
}

/** Valida y guarda la receta (crea o reemplaza). Los Descuentos anteriores no cambian. */
export function guardarReceta(db: BaseDeDatos, productoId: number, form: FormularioReceta): void {
  if (!obtenerProducto(db, productoId)) throw new ErrorDeNegocio('Producto no encontrado', 404);

  const lineasConDatos = form.lineas
    .map((l) => ({ insumoId: (l.insumoId ?? '').trim(), cantidad: (l.cantidad ?? '').trim() }))
    .filter((l) => l.insumoId !== '' || l.cantidad !== '');

  if (lineasConDatos.length === 0) throw new ErrorDeNegocio(MENSAJES_RECETA.sinIngredientes);
  if (lineasConDatos.some((l) => l.insumoId === '')) throw new ErrorDeNegocio(MENSAJES_RECETA.lineaSinInsumo);

  const rendimiento = leerNumero((form.rendimiento ?? '').trim());
  const lineas: LineaReceta[] = lineasConDatos.map((l) => ({
    insumoId: Number(l.insumoId),
    cantidad: leerNumero(l.cantidad),
  }));

  if (!(rendimiento > 0) || lineas.some((l) => !(l.cantidad > 0))) {
    throw new ErrorDeNegocio(MENSAJES_RECETA.valoresInvalidos);
  }
  if (!Number.isInteger(rendimiento)) throw new ErrorDeNegocio(MENSAJES_RECETA.rendimientoEntero);

  const ids = lineas.map((l) => l.insumoId);
  if (new Set(ids).size !== ids.length) throw new ErrorDeNegocio(MENSAJES_RECETA.insumoRepetido);

  // Decisión C: solo se agregan insumos activos; un insumo desactivado que ya estaba en la receta se conserva.
  const yaPresentes = new Set(obtenerReceta(db, productoId)?.ingredientes.map((i) => i.insumo_id) ?? []);
  for (const linea of lineas) {
    const insumo = obtenerInsumo(db, linea.insumoId);
    if (!insumo) throw new ErrorDeNegocio('Insumo no encontrado', 404);
    if (!insumo.activo && !yaPresentes.has(insumo.id)) {
      throw new ErrorDeNegocio(MENSAJES_RECETA.insumoDesactivado(insumo.nombre));
    }
  }

  reemplazarReceta(db, productoId, rendimiento, lineas);
}
