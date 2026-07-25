import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import { ApiBody, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';

import { AuthService } from '@/src/business-logic/auth';
import { Public } from '@/src/common/decorators';
import { LoginDto, RegisterDto } from '@/src/domains/view-models/auth';


const REFRESH_COOKIE = 'refreshToken';

/** Встановлює refresh token як HttpOnly cookie — недоступний для JS на клієнті. */
function setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_COOKIE, refreshToken, {
        httpOnly: true,
        secure: process.env['NODE_ENV'] === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів у мс
        path: '/',
    });
}


@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken } = await this.authService.registerUser(registerDto);

        setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken } = await this.authService.loginUser(loginDto);

        setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    /**
     * @ai-context Обмінює короткоживучий OAuth-код (2 хв) на повноцінну пару токенів.
     * Frontend має викликати цей endpoint одразу після редиректу з Google callback.
     */
    @Post('exchange')
    @ApiOperation({ summary: 'Exchange one-time OAuth code for token pair' })
    @ApiBody({ schema: { properties: { oauthCode: { type: 'string' } } } })
    async exchange(@Body('oauthCode') oauthCode: string, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken } = await this.authService.exchangeOAuthCode(oauthCode);

        setRefreshCookie(res, refreshToken);
        return { accessToken };
    }

    /**
     * @ai-context Refresh token читається з HttpOnly cookie `refreshToken`.
     * Не потребує тіла запиту — cookie надсилає браузер автоматично.
     */
    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token using HttpOnly cookie' })
    async refresh(
        @Req() req: { cookies: Record<string, string> },
        @Res({ passthrough: true }) res: Response,
    ) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        const tokens = await this.authService.refreshTokens(refreshToken);

        setRefreshCookie(res, tokens.refreshToken);
        return { accessToken: tokens.accessToken };
    }

    @Get('google')
    google(@Res() res: Response) {
        return res.redirect(this.authService.getGoogleAuthUrl());
    }

    @Get('google/callback')
    async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
        const frontendUrl = process.env['FRONTEND_URL'] || 'http://127.0.0.1:5173';

        if (!code || !state) {
            return res.redirect(`${frontendUrl}/auth?oauthError=missing_code`);
        }

        try {
            const { oauthCode } = await this.authService.loginWithGoogle(code, state);

            // Передаємо лише короткоживучий одноразовий код, а не самі токени.
            // Frontend одразу обміняє його через POST /auth/exchange.
            return res.redirect(`${frontendUrl}/auth?oauthCode=${encodeURIComponent(oauthCode)}`);
        } catch {
            return res.redirect(`${frontendUrl}/auth?oauthError=google_failed`);
        }
    }
}
