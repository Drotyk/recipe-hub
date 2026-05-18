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

import { RecipeService } from '@/src/business-logic';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateRecipeDto, UpdateRecipeDto } from '@/src/domains/view-models/recipe';
import { ViewUserDto } from '@/src/domains/view-models/user';


@ApiTags('Recipe')
@Controller('recipe')
export class RecipeController {
    constructor(private readonly recipeService: RecipeService) {}

    @Get('collection')
    @ApiOkResponse({ type: ViewUserDto })
    getCollection(@Query() collectionOptions: CollectionOptionsDto) {
        return this.recipeService.getRecipeCollection(collectionOptions)
    }

    @Get(':id')
    getRecipe(@Param('id', ParseIntPipe) id: number) {
        return this.recipeService.getOneById(id);
    }

    @Post()
    createRecipe(
        @Body() body: CreateRecipeDto,
    ) {
        return this.recipeService.createRecipe(body);
    }

    @Patch(':id')
    updateRecipe(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateRecipeDto,
    ) {
        return this.recipeService.updateRecipe(id, body);
    }

    @Delete(':id')
    deleteRecipe(@Param('id', ParseIntPipe) id: number) {
        return this.recipeService.deleteRecipe(id);
    }
}
