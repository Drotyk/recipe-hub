import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '@/src/business-logic/auth';
import { LoginDto, RegisterDto } from '@/src/domains/view-models/auth';


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
}
