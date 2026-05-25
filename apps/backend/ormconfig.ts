import { resolve } from 'path';

import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { loadEnv } from './src/common/utils';


loadEnv();

const isTypeScriptRuntime = __filename.endsWith('.ts');
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
