import { existsSync } from 'fs';
import { resolve } from 'path';

import { configDotenv } from 'dotenv';


const envPaths = [
  resolve(process.cwd(), '.env'),
  resolve(process.cwd(), '../../.env'),
];

export const loadEnv = () => {
  const envPath = envPaths.find((candidate) => existsSync(candidate));

  configDotenv(envPath ? { path: envPath } : undefined);
};
