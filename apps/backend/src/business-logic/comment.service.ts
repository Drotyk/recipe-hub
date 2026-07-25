import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { IJwtUserInfo } from '@/src/common/interfaces';
import { RecipeEntity } from '@/src/domains/entities';
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

    async createComment(recipeId: number, body: CreateCommentDto, currentUser: IJwtUserInfo) {
        const recipeExists = await this.commentRepository.manager
            .getRepository(RecipeEntity)
            .findOne({ where: { id: recipeId } });

        if (!recipeExists) {
            throw new BadRequestException({
                message: 'Recipe was not found',
                recipeId,
            });
        }

        const commentToSave = this.commentRepository.create({
            text: body.text,
            recipeId,
            authorId: currentUser.id,
        });

        const savedComment = await this.commentRepository.save(commentToSave);

        return this.commentRepository.findOne({
            where: { id: savedComment.id },
            relations: {
                author: true,
            },
        });
    }

    async deleteComment(id: number, currentUser: IJwtUserInfo) {
        const comment = await this.commentRepository.findOne({ where: { id } });

        if (!comment) {
            throw new NotFoundException({
                message: 'Comment was not found',
                id,
            });
        }
        if (comment.authorId !== currentUser.id && !currentUser.isAdmin) {
            throw new ForbiddenException({ message: 'You are not allowed to delete this comment' });
        }

        await this.commentRepository.delete(id);
        return comment;
    }
}
