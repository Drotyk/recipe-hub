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
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { CommentService } from '@/src/business-logic';
import { IAuthenticatedRequest } from '@/src/common/interfaces';
import { CreateCommentDto, ViewCommentDto } from '@/src/domains/view-models/comment';


@ApiTags('Comment')
@Controller()
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    @Get('recipe/:recipeId/comments')
    @ApiOkResponse({ type: [ViewCommentDto] })
    async getComments(@Param('recipeId', ParseIntPipe) recipeId: number) {
        const data = await this.commentService.getCommentsForRecipe(recipeId);

        return plainToInstance(ViewCommentDto, data);
    }

    @Post('recipe/:recipeId/comments')
    @ApiOkResponse({ type: ViewCommentDto })
    async createComment(
        @Param('recipeId', ParseIntPipe) recipeId: number,
        @Body() body: CreateCommentDto,
        @Req() req: IAuthenticatedRequest,
    ) {
        const data = await this.commentService.createComment(recipeId, body, req.user);

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
