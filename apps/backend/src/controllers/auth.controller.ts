import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';

import { AuthService } from '@/src/business-logic/auth';
import { Public } from '@/src/common/decorators';
import { LoginDto, RegisterDto } from '@/src/domains/view-models/auth';


@Public()
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    register(@Body() registerDto: RegisterDto) {
        return this.authService.registerUser(registerDto);
    }

    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.loginUser(loginDto);
    }

    @Get('google')
    google(@Res() res) {
        return res.redirect(this.authService.getGoogleAuthUrl());
    }

    @Get('google/callback')
    async googleCallback(@Query('code') code: string, @Query('state') state: string, @Res() res) {
        const frontendUrl = process.env['FRONTEND_URL'] || 'http://127.0.0.1:5173';

        if (!code || !state) {
            return res.redirect(`${frontendUrl}/auth?oauthError=missing_code`);
        }

        try {
            const tokens = await this.authService.loginWithGoogle(code, state);
            const params = new URLSearchParams(tokens);

            return res.redirect(`${frontendUrl}/auth?${params.toString()}`);
        } catch {
            return res.redirect(`${frontendUrl}/auth?oauthError=google_failed`);
        }
    }
}
