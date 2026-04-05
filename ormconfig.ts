import { DataSource, DataSourceOptions } from "typeorm";
import { configDotenv } from "dotenv";
import { resolve } from "path";



configDotenv({ path: resolve(process.cwd(), '.env') });

const ormConfig:DataSourceOptions={
  type: "postgres",
  host: process.env['POSTGRES_HOST'],
  port: Number(process.env['POSTGRES_PORT']),
  username: process.env['POSTGRES_USER'],
  password: process.env['POSTGRES_PASSWORD'],
  database: process.env['POSTGRES_DB'],

  synchronize: false,
  logging: true,

  entities: ["src/entity/**/*.ts"],
  migrations: [resolve(process.cwd(), "type-orm/migrations/**/*.ts")],
}

export default new DataSource(ormConfig);
