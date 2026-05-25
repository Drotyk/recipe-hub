import { resolve } from 'path';

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { configDotenv } from 'dotenv';
import { ExtractJwt, Strategy } from 'passport-jwt';


configDotenv({ path: resolve(process.cwd(), '.env') });


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor () {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env['JWT_SECRET_KEY'],
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async validate (payload: any) {
        return {
            id: payload.id,
            email: payload.email,
            isAdmin: payload.isAdmin,
        };
    }
}
