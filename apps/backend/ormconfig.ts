import { existsSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

import { configDotenv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';


const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
];
const envPath = envPaths.find((candidate) => existsSync(candidate));

configDotenv(envPath ? { path: envPath } : undefined);

function getFilename() {
  if (typeof __filename !== 'undefined') return __filename;

  try {
    throw new Error();
  } catch (e: unknown) {
    const stack = (e instanceof Error ? e.stack : '') || '';
    const match = stack.match(/(?:at\s+|\()([^()]+?):[0-9]+:[0-9]+/);

    if (match && match[1]) {
      let path = match[1];

      if (path.startsWith('file://')) {
        try {
          return fileURLToPath(path);
        } catch {
        }
      }

      return path;
    }
  }
  return 'ormconfig.ts';
}

const filename = getFilename();
const isTypeScriptRuntime = filename.endsWith('.ts');
const runtimeRoot = isTypeScriptRuntime
  ? process.cwd()
  : resolve(process.cwd(), '../../dist/apps/backend');
const entityFileExtension = isTypeScriptRuntime ? 'ts' : 'js';
const migrationFileExtension = isTypeScriptRuntime ? 'ts' : 'js';

export const ormConfig:DataSourceOptions={
  type: 'postgres',
  host: process.env['POSTGRES_HOST'],
  port: Number(process.env['POSTGRES_PORT']),
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DB'],

  synchronize: false,
  logging: true,

  namingStrategy: new SnakeNamingStrategy(),
  entities: [resolve(runtimeRoot, `src/**/*.entity.${entityFileExtension}`)],
  migrations: [resolve(runtimeRoot, `type-orm/migrations/**/*.${migrationFileExtension}`)],
}

export default new DataSource(ormConfig);
