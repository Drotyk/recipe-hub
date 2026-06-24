import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { CommentService } from '@/src/business-logic';
import { IAuthenticatedRequest } from '@/src/common/interfaces';
import { CreateCommentDto, ViewCommentDto } from '@/src/domains/view-models/comment';


@ApiTags('Comment')
@ApiBearerAuth()
@Controller()
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get('recipe/:recipeId/comments')
    @ApiOkResponse({ type: [ViewCommentDto] })
    async getComments(@Param('recipeId', ParseIntPipe) recipeId: number) {
        const data = await this.commentService.getCommentsForRecipe(recipeId);

        return plainToInstance(ViewCommentDto, data);
    }

    @Get('user/:userId/comments')
    @ApiOkResponse({ type: [ViewCommentDto] })
    async getUserComments(@Param('userId', ParseIntPipe) userId: number) {
        const data = await this.commentService.getCommentsForUser(userId);

        return plainToInstance(ViewCommentDto, data);
    }

    @Post('recipe/:recipeId/comments')
    @ApiOkResponse({ type: ViewCommentDto })
    async createComment(
        @Param('recipeId', ParseIntPipe) recipeId: number,
        @Body() body: CreateCommentDto,
        @Req() req: IAuthenticatedRequest,
    ) {
        const data = await this.commentService.createComment(recipeId, body, req.user.id);

        return plainToInstance(ViewCommentDto, data);
    }

    @Delete('comment/:id')
    @ApiOkResponse({ type: ViewCommentDto })
    async deleteComment(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: IAuthenticatedRequest,
    ) {
        const data = await this.commentService.deleteComment(id, req.user);

        return plainToInstance(ViewCommentDto, data);
    }
}
