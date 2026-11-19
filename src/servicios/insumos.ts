// Casos de uso CU-06 Registrar insumo, CU-08 Dar de baja un insumo, CU-09 Editar insumo y CU-10 Reactivar insumo (HU-06).
// Flujo: DSS-04 y DSS-05; editar y reactivar reconstruidos desde el Gherkin, CA8 y EST-01 (ficha HU-06).
import type { BaseDeDatos } from '../db/conexion.js';
import { aplicarEventoInsumo, ErrorDeNegocio, obtenerInsumoPorNombre, type DatosInsumo } from '../dominio/insumo.js';

/** Motivos de rechazo (van entre paréntesis después de «Registro rechazado» o «Edición rechazada»). */
export const MOTIVOS = {
  datoFaltante: 'dato faltante',
  nombreSinLetras: 'el nombre debe contener al menos una letra',
  nombreRepetido: 'ya existe un insumo con ese nombre',
  costoInvalido: 'el costo unitario debe ser un número entero de pesos, CLP, mayor o igual a 0',
  minimoInvalido: 'el stock mínimo debe ser un número mayor o igual a 0',
} as const;

export type Operacion = 'registro' | 'edicion';

export function rechazo(operacion: Operacion, motivo: string): string {
  return `${operacion === 'registro' ? 'Registro rechazado' : 'Edición rechazada'} (${motivo})`;
}

export const MENSAJES_INSUMO = {
  registrado: 'Insumo registrado',
  actualizado: 'Insumo actualizado',
  datoFaltante: rechazo('registro', MOTIVOS.datoFaltante),
  nombreSinLetras: rechazo('registro', MOTIVOS.nombreSinLetras),
  nombreRepetido: rechazo('registro', MOTIVOS.nombreRepetido),
  costoInvalido: rechazo('registro', MOTIVOS.costoInvalido),
  minimoInvalido: rechazo('registro', MOTIVOS.minimoInvalido),
  eliminado: 'Insumo eliminado',
  desactivado: 'Insumo desactivado',
  reactivado: 'Insumo reactivado',
} as const;

/** Datos tal como llegan del formulario (pueden faltar). */
export interface FormularioInsumo {
  nombre?: unknown;
  unidadMedida?: unknown;
  costoUnitario?: unknown;
  stockMinimo?: unknown;
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : typeof valor === 'number' ? String(valor) : '';
}

/** Convierte "2", "2.5" o "2,5" a número; devuelve NaN si no es un número. */
export function leerNumero(valor: string): number {
  if (!/^-?\d+([.,]\d+)?$/.test(valor)) return Number.NaN;
  return Number(valor.replace(',', '.'));
}

/**
 * Costo en CLP (RP-06): solo dígitos, con punto de miles opcional en grupos exactos de tres («1.250» = 1250).
 * «2,5», «2.5» o «-1» no son enteros de pesos válidos: devuelve NaN.
 */
export function leerPesos(valor: string): number {
  if (/^\d+$/.test(valor)) return Number(valor);
  if (/^\d{1,3}(\.\d{3})+$/.test(valor)) return Number(valor.replace(/\./g, ''));
  return Number.NaN;
}

/** HU-06 CA7: el nombre debe contener al menos una letra (se permiten dígitos y símbolos, p. ej. «Leche 2%»). */
export function tieneLetra(nombre: string): boolean {
  return /\p{L}/u.test(nombre);
}

/**
 * Valida los cuatro datos (HU-06 CA1, CA5 y CA7; decisión B). Al editar, la unicidad del nombre
 * excluye al propio insumo.
 */
export function validarInsumo(
  db: BaseDeDatos,
  form: FormularioInsumo,
  operacion: Operacion = 'registro',
  excluirId?: number,
): DatosInsumo {
  const falla = (motivo: string) => new ErrorDeNegocio(rechazo(operacion, motivo));
  const nombre = texto(form.nombre);
  const unidadMedida = texto(form.unidadMedida);
  const costo = texto(form.costoUnitario);
  const minimo = texto(form.stockMinimo);

  if (!nombre || !unidadMedida || !costo || !minimo) throw falla(MOTIVOS.datoFaltante);
  if (!tieneLetra(nombre)) throw falla(MOTIVOS.nombreSinLetras);

  const costoUnitario = leerPesos(costo);
  if (!(costoUnitario >= 0)) throw falla(MOTIVOS.costoInvalido);
  const stockMinimo = leerNumero(minimo);
  if (!(stockMinimo >= 0)) throw falla(MOTIVOS.minimoInvalido);

  const otro = obtenerInsumoPorNombre(db, nombre);
  if (otro && otro.id !== excluirId) throw falla(MOTIVOS.nombreRepetido);

  return { nombre, unidadMedida, costoUnitario, stockMinimo };
}

/** CU-06: registra el insumo con stock 0 y su alerta de stock crítico vigente. */
export function registrarInsumo(db: BaseDeDatos, form: FormularioInsumo): number {
  const datos = validarInsumo(db, form, 'registro');
  return aplicarEventoInsumo(db, { tipo: 'registrar', datos });
}

/** CU-09: edita los cuatro datos; si el insumo está activo, el nuevo mínimo recalcula su alerta. */
export function editarInsumo(db: BaseDeDatos, insumoId: number, form: FormularioInsumo): void {
  const datos = validarInsumo(db, form, 'edicion', insumoId);
  aplicarEventoInsumo(db, { tipo: 'editar', insumoId, datos });
}

/** CU-10: reactiva un insumo desactivado; genera alerta si su stock está en o bajo el mínimo. */
export function reactivarInsumo(db: BaseDeDatos, insumoId: number): void {
  aplicarEventoInsumo(db, { tipo: 'reactivar', insumoId });
}

/** CU-08: eliminar (solo si no tiene recetas ni movimientos). Lanza EliminacionRechazada si no se puede. */
export function eliminarInsumo(db: BaseDeDatos, insumoId: number): void {
  aplicarEventoInsumo(db, { tipo: 'eliminar', insumoId });
}

/** CU-08: desactivar; resuelve la alerta vigente si la había. */
export function desactivarInsumo(db: BaseDeDatos, insumoId: number): void {
  aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId });
}

/** Formato CLP para mostrar: 1250 → «$1.250» (sin decimales). */
export function formatoCLP(valor: number): string {
  // Se arma a mano: en español, Intl no agrupa los números de 4 dígitos (daría «1250»).
  const entero = Math.round(valor);
  const digitos = String(Math.abs(entero)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return (entero < 0 ? '-$' : '$') + digitos;
}
