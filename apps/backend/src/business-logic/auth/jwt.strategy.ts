import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IJwtUserInfo } from '@/src/common/interfaces';
import { loadEnv } from '@/src/common/utils';


loadEnv();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor () {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env['JWT_SECRET_KEY'] || 'default-jwt-secret-key-for-dev',
        });
    }

    async validate (payload: IJwtUserInfo): Promise<IJwtUserInfo> {
        return {
            id: payload.id,
            email: payload.email,
            isAdmin: payload.isAdmin ?? false,
        };
    }
}
