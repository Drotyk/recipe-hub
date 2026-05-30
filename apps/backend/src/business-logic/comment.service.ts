import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { RecipeEntity, UserEntity } from '@/src/domains/entities';
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

    async createComment(recipeId: number, body: CreateCommentDto) {
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
            .findOne({ where: { id: body.authorId } });

        if (!authorExists) {
            throw new BadRequestException({
                message: 'Author user was not found',
                authorId: body.authorId,
            });
        }

        const commentToSave = this.commentRepository.create({
            text: body.text,
            recipeId,
            authorId: body.authorId,
        });

        const savedComment = await this.commentRepository.save(commentToSave);

        return this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: {
                author: true,
            },
        });
    }

    async deleteComment(id: number) {
        const comment = await this.commentRepository.findOne({ where: { id } });

        if (!comment) {
            throw new NotFoundException({
                message: 'Comment was not found',
                id,
            });
        }

        await this.commentRepository.delete(id);
        return comment;
    }
}
