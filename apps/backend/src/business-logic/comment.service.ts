import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { RecipeEntity, UserEntity } from '@/src/domains/entities';
import { IJwtUserInfo } from '@/src/common/interfaces';
import { CreateCommentDto } from '@/src/domains/view-models/comment';
import { CommentRepository } from '@/src/repositories/comment.repository';


@Injectable()
export class CommentService {
    constructor(private readonly commentRepository: CommentRepository) { }

    getCommentsForRecipe(recipeId: number) {
        return this.commentRepository.find({
            where: { recipeId },
            relations: {
                author: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    getCommentsForUser(userId: number) {
        return this.commentRepository.find({
            where: { authorId: userId },
            relations: {
                recipe: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    /**
     * @ai-context Коментар прив'язаний одночасно до recipe і authenticated author.
     * Перед записом перевіряємо обидві сутності, щоб повертати контрольовану API-помилку.
     */
    async createComment(recipeId: number, body: CreateCommentDto, authorId: number) {
        const recipeExists = await this.commentRepository.manager
            .getRepository(RecipeEntity)
            .findOne({ where: { id: recipeId } });

        if (!recipeExists) {
            throw new BadRequestException({
                message: 'Recipe was not found',
                recipeId,
            });
        }

        const authorExists = await this.commentRepository.manager
            .getRepository(UserEntity)
            .findOne({ where: { id: authorId } });

        if (!authorExists) {
            throw new BadRequestException({
                message: 'Author user was not found',
                authorId,
            });
        }

        const commentToSave = this.commentRepository.create({
            text: body.text,
            recipeId,
            authorId,
        });

        const savedComment = await this.commentRepository.save(commentToSave);

        return this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: {
                author: true,
            },
        });
    }

    /**
     * @ai-context Видаляти коментар може тільки його автор або admin.
     * Тут використовується hard delete, на відміну від softDelete для рецептів/інгредієнтів.
     */
    async deleteComment(id: number, currentUser: IJwtUserInfo) {
        const comment = await this.commentRepository.findOne({ where: { id } });

        if (!comment) {
            throw new NotFoundException({
                message: 'Comment was not found',
                id,
            });
        }

        if (!currentUser.isAdmin && comment.authorId !== currentUser.id) {
            throw new ForbiddenException('You can only delete your own comments');
        }

        await this.commentRepository.delete(id);
        return comment;
    }
}
