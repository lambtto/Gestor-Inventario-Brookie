import Database from 'better-sqlite3';
import { readdirSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export type BaseDeDatos = Database.Database;

const carpetaMigraciones = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

/** Abre la base SQLite (archivo o ":memory:") y aplica las migraciones pendientes. */
export function abrirBase(ruta: string = ':memory:'): BaseDeDatos {
  if (ruta !== ':memory:') mkdirSync(dirname(ruta), { recursive: true });
  const db = new Database(ruta);
  db.pragma('foreign_keys = ON');
  aplicarMigraciones(db);
  return db;
}

/** Aplica en orden los archivos NNN_*.sql que aún no están en schema_migrations. */
export function aplicarMigraciones(db: BaseDeDatos): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    nombre TEXT PRIMARY KEY,
    aplicada_en TEXT NOT NULL
  )`);
  const aplicadas = new Set(
    db.prepare('SELECT nombre FROM schema_migrations').all().map((f) => (f as { nombre: string }).nombre),
  );
  const archivos = readdirSync(carpetaMigraciones).filter((a) => a.endsWith('.sql')).sort();
  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) continue;
    const sql = readFileSync(join(carpetaMigraciones, archivo), 'utf8');
    db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (nombre, aplicada_en) VALUES (?, ?)').run(
        archivo,
        new Date().toISOString(),
      );
    })();
  }
}
