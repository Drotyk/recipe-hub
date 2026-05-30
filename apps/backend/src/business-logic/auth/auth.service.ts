import { randomBytes } from 'crypto';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StringValue } from 'ms';


import { UserService } from '@/src/business-logic/user.service';
import { IJwtUserInfo } from '@/src/common/interfaces';
import { LoginDto, RegisterDto } from '@/src/domains/view-models/auth';


@Injectable()
export class AuthService {
    private readonly jwtExpiresIn: StringValue = '1h';
    private readonly jwtRefreshExpiresIn: StringValue = '7d';
    private readonly googleAuthorizeUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    private readonly googleTokenUrl = 'https://oauth2.googleapis.com/token';
    private readonly googleUserInfoUrl = 'https://www.googleapis.com/oauth2/v3/userinfo';

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}

    async registerUser(registerDto: RegisterDto) {
        const registeredUser = await this.userService.createUser(registerDto);

        return this.generateTokenPair(registeredUser);
    }

    private generateTokenPair ({ id, email, isAdmin }: IJwtUserInfo) {
        const payload = { id, email, isAdmin };

        return {
            accessToken: this.jwtService.sign(payload, {
                expiresIn: this.jwtExpiresIn,
            }),
            refreshToken: this.jwtService.sign(payload, {
                expiresIn: this.jwtRefreshExpiresIn,
            }),
        };
    }

    async loginUser(loginDto: LoginDto) {
        const user = await this.userService.getOneByEmail(loginDto.email);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateTokenPair(user);
    }

    getGoogleAuthUrl() {
        const clientId = process.env['GOOGLE_CLIENT_ID'];
        const redirectUri = process.env['GOOGLE_REDIRECT_URI'];

        if (!clientId || !redirectUri) {
            throw new BadRequestException('Google OAuth is not configured');
        }

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'code',
            scope: 'openid email profile',
            prompt: 'select_account',
            state: this.jwtService.sign(
                { provider: 'google', nonce: randomBytes(16).toString('hex') },
                { expiresIn: '10m' },
            ),
        });

        return `${this.googleAuthorizeUrl}?${params.toString()}`;
    }

    async loginWithGoogle(code: string, state: string) {
        const clientId = process.env['GOOGLE_CLIENT_ID'];
        const clientSecret = process.env['GOOGLE_CLIENT_SECRET'];
        const redirectUri = process.env['GOOGLE_REDIRECT_URI'];

        if (!clientId || !clientSecret || !redirectUri) {
            throw new BadRequestException('Google OAuth is not configured');
        }

        try {
            const statePayload = this.jwtService.verify(state) as { provider?: string };

            if (statePayload.provider !== 'google') {
                throw new Error('Invalid OAuth state provider');
            }
        } catch {
            throw new UnauthorizedException('Invalid Google OAuth state');
        }

        const tokenResponse = await fetch(this.googleTokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        if (!tokenResponse.ok) {
            throw new UnauthorizedException('Google authorization failed');
        }

        const tokenData = await tokenResponse.json() as { access_token?: string };

        if (!tokenData.access_token) {
            throw new UnauthorizedException('Google access token was not returned');
        }

        const userInfoResponse = await fetch(this.googleUserInfoUrl, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        if (!userInfoResponse.ok) {
            throw new UnauthorizedException('Google profile request failed');
        }

        const googleUser = await userInfoResponse.json() as {
            email?: string;
            email_verified?: boolean;
            name?: string;
        };

        if (!googleUser.email || !googleUser.email_verified) {
            throw new UnauthorizedException('Google account email is not verified');
        }

        const existingUser = await this.userService.getOneByEmail(googleUser.email);

        if (existingUser) {
            return this.generateTokenPair(existingUser);
        }

        const generatedPassword = randomBytes(24).toString('hex');
        const createdUser = await this.userService.createUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            password: generatedPassword,
        });

        return this.generateTokenPair(createdUser);
    }
}
