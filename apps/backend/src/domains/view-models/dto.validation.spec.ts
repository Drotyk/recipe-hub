import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { LoginDto } from '@/src/domains/view-models/auth/login.dto';
import { RegisterDto } from '@/src/domains/view-models/auth/register.dto';
import { CreateCommentDto } from '@/src/domains/view-models/comment';
import { CreateRecipeDto } from '@/src/domains/view-models/recipe';


// ─── helper ─────────────────────────────────────────────────────────────────

async function validateDto<T extends object>(cls: new () => T, plain: Record<string, unknown>) {
    const instance = plainToInstance(cls, plain, { excludeExtraneousValues: true });
    const errors = await validate(instance as object);

    return errors.map((e) => Object.values(e.constraints ?? {}).join(', ')).join('; ');
}

// ─── CreateRecipeDto ─────────────────────────────────────────────────────────

describe('CreateRecipeDto', () => {
    it('passes with valid data', async () => {
        const errors = await validateDto(CreateRecipeDto, { name: 'Pancakes', text: 'Mix and fry' });

        expect(errors).toBe('');
    });

    it('rejects empty name', async () => {
        const errors = await validateDto(CreateRecipeDto, { name: '', text: 'Mix and fry' });

        expect(errors).not.toBe('');
    });

    it('rejects empty text', async () => {
        const errors = await validateDto(CreateRecipeDto, { name: 'Pancakes', text: '' });

        expect(errors).not.toBe('');
    });

    it('rejects missing name', async () => {
        const errors = await validateDto(CreateRecipeDto, { text: 'Mix and fry' });

        expect(errors).not.toBe('');
    });

    it('rejects missing text', async () => {
        const errors = await validateDto(CreateRecipeDto, { name: 'Pancakes' });

        expect(errors).not.toBe('');
    });
});

// ─── CreateCommentDto ─────────────────────────────────────────────────────────

describe('CreateCommentDto', () => {
    it('passes with valid text', async () => {
        const errors = await validateDto(CreateCommentDto, { text: 'Lovely recipe!' });

        expect(errors).toBe('');
    });

    it('rejects empty text', async () => {
        const errors = await validateDto(CreateCommentDto, { text: '' });

        expect(errors).not.toBe('');
    });

    it('ignores any client-supplied authorId field (excluded from transform)', async () => {
        // authorId was removed from DTO — it should be stripped by class-transformer
        const instance = plainToInstance(CreateCommentDto, { text: 'Hello', authorId: 999 }, { excludeExtraneousValues: true });

        expect((instance as unknown as Record<string, unknown>)['authorId']).toBeUndefined();
    });
});

// ─── LoginDto ─────────────────────────────────────────────────────────────────

describe('LoginDto', () => {
    it('passes with valid credentials', async () => {
        const errors = await validateDto(LoginDto, { email: 'user@test.com', password: 'secret123' });

        expect(errors).toBe('');
    });

    it('rejects invalid email format', async () => {
        const errors = await validateDto(LoginDto, { email: 'not-an-email', password: 'secret123' });

        expect(errors).not.toBe('');
    });

    it('rejects password shorter than 8 characters', async () => {
        const errors = await validateDto(LoginDto, { email: 'user@test.com', password: 'short' });

        expect(errors).not.toBe('');
    });
});

// ─── RegisterDto ─────────────────────────────────────────────────────────────

describe('RegisterDto', () => {
    const validPayload = {
        email: 'new@test.com',
        name: 'Alice',
        password: 'password123',
        repeatedPassword: 'password123',
    };

    it('passes with matching passwords', async () => {
        const errors = await validateDto(RegisterDto, validPayload);

        expect(errors).toBe('');
    });

    it('rejects when passwords do not match', async () => {
        const errors = await validateDto(RegisterDto, { ...validPayload, repeatedPassword: 'different123' });

        expect(errors).not.toBe('');
    });

    it('rejects invalid email', async () => {
        const errors = await validateDto(RegisterDto, { ...validPayload, email: 'bad-email' });

        expect(errors).not.toBe('');
    });

    it('rejects password shorter than 8 characters', async () => {
        const errors = await validateDto(RegisterDto, { ...validPayload, password: 'short', repeatedPassword: 'short' });

        expect(errors).not.toBe('');
    });

    it('rejects empty name', async () => {
        const errors = await validateDto(RegisterDto, { ...validPayload, name: '' });

        expect(errors).not.toBe('');
    });
});
