import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';

import { UserService } from '@/src/business-logic/user.service';


// ─── helpers ────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<{ id: number; email: string; isAdmin: boolean; password: string }> = {}) {
    return {
        id: 1,
        email: 'user@test.com',
        isAdmin: false,
        password: '$2b$10$hashedPassword',
        ...overrides,
    };
}

// ─── mocks ──────────────────────────────────────────────────────────────────

const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
    verify: jest.fn(),
};

const mockUserService = {
    createUser: jest.fn(),
    getOneByEmail: jest.fn(),
};

// ─── suite ──────────────────────────────────────────────────────────────────

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: mockJwtService },
                { provide: UserService, useValue: mockUserService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jest.clearAllMocks();
    });

    // ── registerUser ────────────────────────────────────────────────────────

    describe('registerUser', () => {
        it('creates a user and returns a token pair', async () => {
            const user = makeUser();

            mockUserService.createUser.mockResolvedValue(user);

            const result = await service.registerUser({
                email: user.email,
                name: 'Test User',
                password: 'password123',
                repeatedPassword: 'password123',
            });

            expect(mockUserService.createUser).toHaveBeenCalledTimes(1);
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('propagates BadRequestException when email already exists', async () => {
            mockUserService.createUser.mockRejectedValue(
                new BadRequestException('User with this email already exists'),
            );

            await expect(
                service.registerUser({
                    email: 'taken@test.com',
                    name: 'Dup',
                    password: 'password123',
                    repeatedPassword: 'password123',
                }),
            ).rejects.toBeInstanceOf(BadRequestException);
        });
    });

    // ── loginUser ───────────────────────────────────────────────────────────

    describe('loginUser', () => {
        it('returns token pair for valid credentials', async () => {
            const password = 'password123';
            const user = makeUser({ password: await bcrypt.hash(password, 10) });

            mockUserService.getOneByEmail.mockResolvedValue(user);

            const result = await service.loginUser({ email: user.email, password });

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('throws UnauthorizedException for unknown email', async () => {
            mockUserService.getOneByEmail.mockResolvedValue(null);

            await expect(
                service.loginUser({ email: 'ghost@test.com', password: 'password123' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException for wrong password', async () => {
            const user = makeUser({ password: await bcrypt.hash('correctPassword', 10) });

            mockUserService.getOneByEmail.mockResolvedValue(user);

            await expect(
                service.loginUser({ email: user.email, password: 'wrongPassword' }),
            ).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('returns the same error message for unknown email and wrong password (no user enumeration)', async () => {
            mockUserService.getOneByEmail.mockResolvedValue(null);
            let errorUnknown: UnauthorizedException | undefined;

            try {
                await service.loginUser({ email: 'ghost@test.com', password: 'password123' });
            } catch (e) {
                errorUnknown = e as UnauthorizedException;
            }

            const user = makeUser({ password: await bcrypt.hash('correct', 10) });

            mockUserService.getOneByEmail.mockResolvedValue(user);
            let errorWrongPwd: UnauthorizedException | undefined;

            try {
                await service.loginUser({ email: user.email, password: 'wrong_password' });
            } catch (e) {
                errorWrongPwd = e as UnauthorizedException;
            }

            expect(errorUnknown?.message).toBe(errorWrongPwd?.message);
        });
    });

    // ── refreshTokens ───────────────────────────────────────────────────────

    describe('refreshTokens', () => {
        it('issues a new token pair for a valid refresh token', async () => {
            mockJwtService.verify.mockReturnValue({ id: 1, email: 'user@test.com', isAdmin: false });

            const result = await service.refreshTokens('valid-refresh-token');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('throws UnauthorizedException for an expired or invalid refresh token', async () => {
            mockJwtService.verify.mockImplementation(() => { throw new Error('jwt expired'); });

            await expect(service.refreshTokens('bad-token')).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });

    // ── exchangeOAuthCode ───────────────────────────────────────────────────

    describe('exchangeOAuthCode', () => {
        it('issues a token pair for a valid oauth-code', async () => {
            mockJwtService.verify.mockReturnValue({
                id: 1,
                email: 'oauth@test.com',
                isAdmin: false,
                type: 'oauth-code',
            });

            const result = await service.exchangeOAuthCode('valid-oauth-code');

            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
        });

        it('throws UnauthorizedException when token type is not oauth-code', async () => {
            mockJwtService.verify.mockReturnValue({ id: 1, email: 'user@test.com', type: 'wrong-type' });

            await expect(service.exchangeOAuthCode('wrong-type-token')).rejects.toBeInstanceOf(UnauthorizedException);
        });

        it('throws UnauthorizedException for an expired oauth code', async () => {
            mockJwtService.verify.mockImplementation(() => { throw new Error('jwt expired'); });

            await expect(service.exchangeOAuthCode('expired-code')).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});
