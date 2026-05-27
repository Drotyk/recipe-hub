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
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { RecipeService } from '@/src/business-logic';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CollectionRecipeDto, CreateRecipeDto, UpdateRecipeDto, ViewRecipeDto } from '@/src/domains/view-models/recipe';


@ApiTags('Recipe')
@Controller('recipe')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get('collection')
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
    ) {
        const data = await this.recipeService.createRecipe(body);

        return plainToInstance(ViewRecipeDto, data);
    }

    @Patch(':id')
    async updateRecipe(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateRecipeDto,
    ) {
        const data = await this.recipeService.updateRecipe(id, body);

        return plainToInstance(ViewRecipeDto, data);
    }

    @Delete(':id')
    async deleteRecipe(@Param('id', ParseIntPipe) id: number) {
        const data = await this.recipeService.deleteRecipe(id);

        return plainToInstance(ViewRecipeDto, data);
    }
}
