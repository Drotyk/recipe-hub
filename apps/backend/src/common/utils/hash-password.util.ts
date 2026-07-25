import * as bcrypt from 'bcrypt';

import { loadEnv } from './load-env.util';


loadEnv();

export const hashPassword = (password: string): Promise<string> => {
    const salt = process.env['PASSWORD_SALT'] || 10;

    return bcrypt.hash(password, salt);
};
