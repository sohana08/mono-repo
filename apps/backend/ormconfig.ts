// apps/backend/ormconfig.ts
import '../backend/src/boilerplate.polyfill'; // polyfills, must be first
import { SnakeNamingStrategy } from './src/snake-naming.strategy';

import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
// Load envs (adjust list to your repo)
for (const f of ['.env.shared', 'apps/backend/.env', '.env']) {
  const p = resolve(process.cwd(), f);
  if (existsSync(p)) config({ path: p, override: true });
}

import { DataSource } from 'typeorm';
const isTs = __filename.endsWith('.ts');

const MIGRATIONS = isTs
  ? 'apps/backend/src/database/migrations/*.{ts,js}'
  : 'dist/apps/backend/src/database/migrations/*.js';


export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    isTs
      ? 'apps/backend/src/modules/**/*.entity.ts'
      : 'dist/apps/backend/src/modules/**/*.entity.js',
    // include shared lib entities if you have any there:
    isTs
      ? 'libs/**/src/**/*.entity.ts'
      : 'dist/libs/**/src/**/*.entity.js',
  ],
  migrations: [MIGRATIONS],      // <-- THIS must match your file

  // Use CWD-based, forward-slash globs so running from root works
  // entities: [
  //   'apps/backend/src/modules/**/*.entity.ts',
  //   'apps/backend/src/modules/**/*.view-entity.ts',
  //   // include shared lib entities if any live there:
  //   'libs/**/src/**/*.entity.ts',
  // ],
  // migrations: ['apps/backend/src/database/migrations/*.{ts,js}'],

  synchronize: false,
  logging: false,
});
