import { Injectable, UnauthorizedException } from '@nestjs/common';
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
}
