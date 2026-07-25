import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { RecipeService } from './recipe.service';

import { IJwtUserInfo } from '@/src/common/interfaces';
import { RecipeEntity } from '@/src/domains/entities';
import { UpdateRecipeDto } from '@/src/domains/view-models/recipe';
import { RecipeRepository } from '@/src/repositories/recipe.repository';


// ─── helpers ────────────────────────────────────────────────────────────────

function makeRecipe(overrides: Partial<{ id: number; authorId: number; name: string; text: string }> = {}) {
    return { id: 1, authorId: 10, name: 'Pancakes', text: 'Mix and fry', ...overrides };
}

function makeUser(overrides: Partial<IJwtUserInfo> = {}): IJwtUserInfo {
    return { id: 10, email: 'author@test.com', isAdmin: false, ...overrides };
}

function updateDto(text: string): UpdateRecipeDto {
    return { text } as UpdateRecipeDto;
}

// ─── mocks ──────────────────────────────────────────────────────────────────

const mockRecipeRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    findAndCount: jest.fn(),
};

// ─── suite ──────────────────────────────────────────────────────────────────

describe('RecipeService', () => {
    let service: RecipeService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecipeService,
                { provide: RecipeRepository, useValue: mockRecipeRepository },
            ],
        }).compile();

        service = module.get<RecipeService>(RecipeService);
        jest.clearAllMocks();
    });

    // ── createRecipe ─────────────────────────────────────────────────────────

    describe('createRecipe', () => {
        it('saves recipe with authorId taken from currentUser', async () => {
            const user = makeUser({ id: 42 });
            const dto = { name: 'Pasta', text: 'Boil water' };
            const saved = { id: 5, ...dto, authorId: user.id } as RecipeEntity;

            mockRecipeRepository.save.mockResolvedValue(saved);

            const result = await service.createRecipe(dto, user);

            expect(mockRecipeRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({ authorId: 42 }),
            );
            expect(result.authorId).toBe(42);
        });
    });

    // ── updateRecipe ─────────────────────────────────────────────────────────

    describe('updateRecipe', () => {
        it('allows the author to update their own recipe', async () => {
            const user = makeUser();
            const recipe = makeRecipe({ authorId: user.id });

            mockRecipeRepository.findOne
                .mockResolvedValueOnce(recipe)
                .mockResolvedValueOnce(recipe);
            mockRecipeRepository.update.mockResolvedValue(undefined);

            await expect(service.updateRecipe(1, updateDto('New text'), user)).resolves.not.toThrow();
            expect(mockRecipeRepository.update).toHaveBeenCalledTimes(1);
        });

        it('allows an admin to update any recipe', async () => {
            const admin = makeUser({ id: 99, isAdmin: true });
            const recipe = makeRecipe({ authorId: 10 });

            mockRecipeRepository.findOne.mockResolvedValue(recipe);
            mockRecipeRepository.update.mockResolvedValue(undefined);

            await expect(service.updateRecipe(1, updateDto('Admin edit'), admin)).resolves.not.toThrow();
        });

        it('throws ForbiddenException when a non-author tries to update', async () => {
            const stranger = makeUser({ id: 999 });
            const recipe = makeRecipe({ authorId: 10 });

            mockRecipeRepository.findOne.mockResolvedValue(recipe);

            await expect(service.updateRecipe(1, updateDto('Hack'), stranger))
                .rejects.toBeInstanceOf(ForbiddenException);
        });

        it('throws NotFoundException when recipe does not exist', async () => {
            mockRecipeRepository.findOne.mockResolvedValue(null);

            await expect(service.updateRecipe(999, updateDto('x'), makeUser()))
                .rejects.toBeInstanceOf(NotFoundException);
        });
    });

    // ── deleteRecipe ─────────────────────────────────────────────────────────

    describe('deleteRecipe', () => {
        it('allows the author to delete their own recipe', async () => {
            const user = makeUser();
            const recipe = makeRecipe({ authorId: user.id });

            mockRecipeRepository.findOne.mockResolvedValue(recipe);
            mockRecipeRepository.softDelete.mockResolvedValue(undefined);

            await expect(service.deleteRecipe(1, user)).resolves.not.toThrow();
            expect(mockRecipeRepository.softDelete).toHaveBeenCalledWith(1);
        });

        it('allows an admin to delete any recipe', async () => {
            const admin = makeUser({ id: 99, isAdmin: true });
            const recipe = makeRecipe({ authorId: 10 });

            mockRecipeRepository.findOne.mockResolvedValue(recipe);
            mockRecipeRepository.softDelete.mockResolvedValue(undefined);

            await expect(service.deleteRecipe(1, admin)).resolves.not.toThrow();
        });

        it('throws ForbiddenException when a non-owner tries to delete', async () => {
            const stranger = makeUser({ id: 999 });
            const recipe = makeRecipe({ authorId: 10 });

            mockRecipeRepository.findOne.mockResolvedValue(recipe);

            await expect(service.deleteRecipe(1, stranger))
                .rejects.toBeInstanceOf(ForbiddenException);
        });

        it('throws NotFoundException when recipe does not exist', async () => {
            mockRecipeRepository.findOne.mockResolvedValue(null);

            await expect(service.deleteRecipe(999, makeUser()))
                .rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
