// Casos de uso CU-06 Registrar insumo y CU-08 Dar de baja un insumo (HU-06). Flujo: DSS-04 y DSS-05.
import type { BaseDeDatos } from '../db/conexion.js';
import { aplicarEventoInsumo, ErrorDeNegocio, obtenerInsumoPorNombre, type DatosInsumo } from '../dominio/insumo.js';

export const MENSAJES_INSUMO = {
  registrado: 'Insumo registrado',
  datoFaltante: 'Registro rechazado (dato faltante)',
  nombreRepetido: 'Registro rechazado (ya existe un insumo con ese nombre)',
  numeroInvalido:
    'Registro rechazado (el costo unitario y el stock mínimo deben ser números mayores o iguales a 0)',
  eliminado: 'Insumo eliminado',
  desactivado: 'Insumo desactivado',
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

/** Valida los cuatro datos obligatorios (HU-06 CA1) y las reglas de la decisión B. */
export function validarInsumo(db: BaseDeDatos, form: FormularioInsumo): DatosInsumo {
  const nombre = texto(form.nombre);
  const unidadMedida = texto(form.unidadMedida);
  const costo = texto(form.costoUnitario);
  const minimo = texto(form.stockMinimo);

  if (!nombre || !unidadMedida || !costo || !minimo) throw new ErrorDeNegocio(MENSAJES_INSUMO.datoFaltante);

  const costoUnitario = leerNumero(costo);
  const stockMinimo = leerNumero(minimo);
  if (!(costoUnitario >= 0) || !(stockMinimo >= 0)) throw new ErrorDeNegocio(MENSAJES_INSUMO.numeroInvalido);

  if (obtenerInsumoPorNombre(db, nombre)) throw new ErrorDeNegocio(MENSAJES_INSUMO.nombreRepetido);

  return { nombre, unidadMedida, costoUnitario, stockMinimo };
}

/** CU-06: registra el insumo con stock 0 y su alerta de stock crítico vigente. */
export function registrarInsumo(db: BaseDeDatos, form: FormularioInsumo): number {
  const datos = validarInsumo(db, form);
  return aplicarEventoInsumo(db, { tipo: 'registrar', datos });
}

/** CU-08: eliminar (solo si no tiene recetas ni movimientos). Lanza EliminacionRechazada si no se puede. */
export function eliminarInsumo(db: BaseDeDatos, insumoId: number): void {
  aplicarEventoInsumo(db, { tipo: 'eliminar', insumoId });
}

/** CU-08: desactivar; resuelve la alerta vigente si la había. */
export function desactivarInsumo(db: BaseDeDatos, insumoId: number): void {
  aplicarEventoInsumo(db, { tipo: 'desactivar', insumoId });
}
