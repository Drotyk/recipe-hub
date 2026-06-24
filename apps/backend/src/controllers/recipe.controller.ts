import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { RecipeService } from '@/src/business-logic';
import { Public } from '@/src/common/decorators';
import { IAuthenticatedRequest } from '@/src/common/interfaces';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CollectionRecipeDto, CreateRecipeDto, UpdateRecipeDto, ViewRecipeDto } from '@/src/domains/view-models/recipe';


@ApiTags('Recipe')
@ApiBearerAuth()
@Controller('recipe')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get('collection')
    @Public()
    @ApiOkResponse({ type: CollectionRecipeDto })
    async getCollection(@Query() collectionOptions: CollectionOptionsDto) {
        const data = await this.recipeService.getRecipeCollection(collectionOptions);

        return plainToInstance(CollectionRecipeDto, data);
    }

    @Get(':id')
    async getRecipe(@Param('id', ParseIntPipe) id: number) {
        const data = await this.recipeService.getOneById(id);

        return plainToInstance(ViewRecipeDto, data);
    }

    @Post()
    async createRecipe(
        @Body() body: CreateRecipeDto,
        @Req() req: IAuthenticatedRequest,
    ) {
        const data = await this.recipeService.createRecipe(body, req.user.id);

        return plainToInstance(ViewRecipeDto, data);
    }

    @Patch(':id')
    async updateRecipe(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateRecipeDto,
        @Req() req: IAuthenticatedRequest,
    ) {
        const data = await this.recipeService.updateRecipe(id, body, req.user);

        return plainToInstance(ViewRecipeDto, data);
    }

    @Delete(':id')
    async deleteRecipe(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: IAuthenticatedRequest,
    ) {
        const data = await this.recipeService.deleteRecipe(id, req.user);

        return plainToInstance(ViewRecipeDto, data);
    }
}
