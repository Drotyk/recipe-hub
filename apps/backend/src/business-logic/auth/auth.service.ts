import { randomBytes } from 'crypto';

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '@/src/business-logic/user.service';
import { IJwtUserInfo } from '@/src/common/interfaces';
import { LoginDto, RegisterDto } from '@/src/domains/view-models/auth';


@Injectable()
export class AuthService {
    private readonly jwtExpiresIn = '1h';
    private readonly jwtRefreshExpiresIn = '7d';
    private readonly oauthCodeExpiresIn = '2m';
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

    /**
     * @ai-context JWT payload має залишатися синхронізованим з frontend `SessionUser`.
     * Якщо додати поле сюди, перевір `apps/frontend/src/auth.tsx`.
     */
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

    /**
     * @ai-context Для login навмисно повертаємо однакову помилку для невідомого email
     * і неправильного пароля, щоб не розкривати існування акаунта.
     */
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

    /**
     * @ai-context Перевіряє refresh token і видає нову пару токенів.
     * Refresh token передається через HttpOnly cookie, тому доступний лише серверу.
     */
    async refreshTokens(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken) as IJwtUserInfo;

            return this.generateTokenPair({
                id: payload.id,
                email: payload.email,
                isAdmin: payload.isAdmin,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }
    }

    /**
     * @ai-context Обмінює короткоживучий одноразовий OAuth-код на повноцінну пару токенів.
     * Код підписано JWT на 2 хвилини і містить лише user payload — жодних session secrets.
     */
    async exchangeOAuthCode(oauthCode: string) {
        try {
            const payload = this.jwtService.verify(oauthCode) as IJwtUserInfo & { type?: string };

            if (payload.type !== 'oauth-code') {
                throw new Error('Wrong token type');
            }

            return this.generateTokenPair({
                id: payload.id,
                email: payload.email,
                isAdmin: payload.isAdmin,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired OAuth code');
        }
    }

    /**
     * @ai-context OAuth state підписується JWT на 10 хвилин.
     * Callback має перевірити provider, щоб не приймати чужий або підмінений state.
     */
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

    /**
     * @ai-context Google OAuth або логінить існуючого користувача за verified email,
     * або створює нового з випадковим паролем, бо пароль напряму не використовується.
     * Повертає короткоживучий одноразовий код (2 хв), а не токени напряму,
     * щоб не передавати session secrets через URL або історію браузера.
     */
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

        const user = existingUser ?? await this.userService.createUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.email.split('@')[0],
            password: randomBytes(24).toString('hex'),
        });

        // Повертаємо короткоживучий одноразовий код замість токенів,
        // щоб вони не залишалися в URL-рядку / history браузера.
        const oauthCode = this.jwtService.sign(
            { id: user.id, email: user.email, isAdmin: (user as IJwtUserInfo).isAdmin ?? false, type: 'oauth-code' },
            { expiresIn: this.oauthCodeExpiresIn },
        );

        return { oauthCode };
    }
}
