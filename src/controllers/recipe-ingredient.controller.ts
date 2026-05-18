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

import { RecipeIngredientService } from '@/src/business-logic';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import {
    CreateRecipeIngredientsDto,
    RecipeIngredientsCollectionDto,
    UpdateRecipeIngredientsDto,
    ViewRecipeIngredientDto,
} from '@/src/domains/view-models/recipe-ingredients';


@ApiTags('RecipeIngredient')
@Controller('recipeIngredient')
export class RecipeIngredientController {
    constructor(private readonly recipeIngredientService: RecipeIngredientService) {}

    @Get('collection')
    @ApiOkResponse({ type: RecipeIngredientsCollectionDto })
    getRecipeIngredientCollection(@Query() collectionOptions: CollectionOptionsDto) {
        return this.recipeIngredientService.getRecipeIngredientCollection(collectionOptions);
    }

    @Get(':id')
    @ApiOkResponse({ type: ViewRecipeIngredientDto })
    getRecipeIngredient(@Param('id', ParseIntPipe) id: number) {
        return this.recipeIngredientService.getOneById(id);
    }

    @Post()
    createRecipeIngredient(
        @Body() createRecipeIngredientDto: CreateRecipeIngredientsDto,
    ) {
        return this.recipeIngredientService.createRecipeIngredient(createRecipeIngredientDto);
    }

    @Patch(':id')
    updateRecipeIngredient(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateRecipeIngredientsDto,
    ) {
        return this.recipeIngredientService.updateRecipeIngredient(id, body);
    }

    @Delete(':id')
    deleteRecipeIngredient(@Param('id', ParseIntPipe) id: number) {
        return this.recipeIngredientService.deleteRecipeIngredient(id);
    }
}
