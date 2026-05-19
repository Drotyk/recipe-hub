import { resolve } from 'path';

import * as bcrypt from 'bcrypt';
import { configDotenv } from 'dotenv';


configDotenv({ path: resolve(process.cwd(), '.env') });

export const hashPassword = (password: string) => {
    return bcrypt.hash(
        password,
        process.env.PASSWORD_SALT,
    );
}
