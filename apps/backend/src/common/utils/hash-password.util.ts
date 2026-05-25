import * as bcrypt from 'bcrypt';

import { loadEnv } from './load-env.util';


loadEnv();

export const hashPassword = (password: string) => {
    return bcrypt.hash(
        password,
        process.env.PASSWORD_SALT,
    );
}
