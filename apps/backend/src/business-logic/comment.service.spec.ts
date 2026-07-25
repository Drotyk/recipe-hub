import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { CommentService } from './comment.service';

import { IJwtUserInfo } from '@/src/common/interfaces';
import { RecipeEntity } from '@/src/domains/entities';
import { CommentRepository } from '@/src/repositories/comment.repository';


// ─── helpers ────────────────────────────────────────────────────────────────

function makeComment(overrides: Partial<{ id: number; authorId: number; text: string; recipeId: number }> = {}) {
    return { id: 1, authorId: 10, text: 'Great recipe!', recipeId: 5, ...overrides };
}

function makeUser(overrides: Partial<IJwtUserInfo> = {}): IJwtUserInfo {
    return { id: 10, email: 'author@test.com', isAdmin: false, ...overrides };
}

// ─── mocks ──────────────────────────────────────────────────────────────────

const recipeRepoMock = { findOne: jest.fn() };

const mockCommentRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    manager: {
        getRepository: jest.fn().mockReturnValue(recipeRepoMock),
    },
};

// ─── suite ──────────────────────────────────────────────────────────────────

describe('CommentService', () => {
    let service: CommentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CommentService,
                { provide: CommentRepository, useValue: mockCommentRepository },
            ],
        }).compile();

        service = module.get<CommentService>(CommentService);
        jest.clearAllMocks();

        // Restore manager mock after clearAllMocks
        mockCommentRepository.manager.getRepository.mockReturnValue(recipeRepoMock);
    });

    // ── createComment ─────────────────────────────────────────────────────────

    describe('createComment', () => {
        it('creates comment with authorId from currentUser (not from DTO)', async () => {
            const user = makeUser({ id: 42 });

            recipeRepoMock.findOne.mockResolvedValue({ id: 5 });

            const commentEntity = makeComment({ authorId: user.id });

            mockCommentRepository.create.mockReturnValue(commentEntity);
            mockCommentRepository.save.mockResolvedValue(commentEntity);
            mockCommentRepository.findOne.mockResolvedValue({ ...commentEntity, author: { id: user.id } });

            await service.createComment(5, { text: 'Nice!' }, user);

            expect(mockCommentRepository.create).toHaveBeenCalledWith(
                expect.objectContaining({ authorId: 42 }),
            );
        });

        it('throws BadRequestException when recipe does not exist', async () => {
            recipeRepoMock.findOne.mockResolvedValue(null);

            await expect(
                service.createComment(999, { text: 'hello' }, makeUser()),
            ).rejects.toBeInstanceOf(BadRequestException);
        });

        it('uses manager.getRepository(RecipeEntity) to check recipe existence', async () => {
            recipeRepoMock.findOne.mockResolvedValue(null);

            await expect(service.createComment(1, { text: 'x' }, makeUser())).rejects.toThrow();

            expect(mockCommentRepository.manager.getRepository).toHaveBeenCalledWith(RecipeEntity);
        });
    });

    // ── deleteComment ─────────────────────────────────────────────────────────

    describe('deleteComment', () => {
        it('allows the author to delete their own comment', async () => {
            const user = makeUser();
            const comment = makeComment({ authorId: user.id });

            mockCommentRepository.findOne.mockResolvedValue(comment);
            mockCommentRepository.delete.mockResolvedValue(undefined);

            await expect(service.deleteComment(1, user)).resolves.not.toThrow();
            expect(mockCommentRepository.delete).toHaveBeenCalledWith(1);
        });

        it('allows an admin to delete any comment', async () => {
            const admin = makeUser({ id: 99, isAdmin: true });
            const comment = makeComment({ authorId: 10 });

            mockCommentRepository.findOne.mockResolvedValue(comment);
            mockCommentRepository.delete.mockResolvedValue(undefined);

            await expect(service.deleteComment(1, admin)).resolves.not.toThrow();
        });

        it('throws ForbiddenException when a non-author tries to delete', async () => {
            const stranger = makeUser({ id: 999 });
            const comment = makeComment({ authorId: 10 });

            mockCommentRepository.findOne.mockResolvedValue(comment);

            await expect(service.deleteComment(1, stranger))
                .rejects.toBeInstanceOf(ForbiddenException);
        });

        it('throws NotFoundException when comment does not exist', async () => {
            mockCommentRepository.findOne.mockResolvedValue(null);

            await expect(service.deleteComment(999, makeUser()))
                .rejects.toBeInstanceOf(NotFoundException);
        });
    });
});
