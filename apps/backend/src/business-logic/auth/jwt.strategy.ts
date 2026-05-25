import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { loadEnv } from '@/src/common/utils';


loadEnv();


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
