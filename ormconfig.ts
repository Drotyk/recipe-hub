import { resolve } from 'path';

import { configDotenv } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';


configDotenv({ path: resolve(process.cwd(), '.env') });

const isTypeScriptRuntime = __filename.endsWith('.ts');
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

  entities: [resolve(process.cwd(), `src/**/*.entity.${entityFileExtension}`)],
  migrations: [resolve(process.cwd(), `${isTypeScriptRuntime ? 'type-orm' : 'dist/type-orm'}/migrations/**/*.${migrationFileExtension}`)],
}

export default new DataSource(ormConfig);
