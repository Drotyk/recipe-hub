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

import { RecipeIngredientService } from '@/src/business-logic';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import {
    CreateRecipeIngredientsDto,
    CollectionRecipeIngredientsDto,
    UpdateRecipeIngredientsDto,
    ViewRecipeIngredientDto,
} from '@/src/domains/view-models/recipe-ingredients';


@ApiTags('RecipeIngredient')
@Controller('recipeIngredient')
export class RecipeIngredientController {
    constructor(private readonly recipeIngredientService: RecipeIngredientService) {}

    @Get('collection')
    @ApiOkResponse({ type: CollectionRecipeIngredientsDto })
    async getRecipeIngredientCollection(@Query() collectionOptions: CollectionOptionsDto) {
        const data = await this.recipeIngredientService.getRecipeIngredientCollection(collectionOptions);

        return plainToInstance(CollectionRecipeIngredientsDto, data);
    }

    @Get(':id')
    @ApiOkResponse({ type: ViewRecipeIngredientDto })
    async getRecipeIngredient(@Param('id', ParseIntPipe) id: number) {
        const data = await this.recipeIngredientService.getOneById(id);

        return plainToInstance(ViewRecipeIngredientDto, data);
    }

    @Post()
    async createRecipeIngredient(
        @Body() createRecipeIngredientDto: CreateRecipeIngredientsDto,
    ) {
        const data = await this.recipeIngredientService.createRecipeIngredient(createRecipeIngredientDto);

        return plainToInstance(ViewRecipeIngredientDto, data);
    }

    @Patch(':id')
    async updateRecipeIngredient(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateRecipeIngredientsDto,
    ) {
        const data = await this.recipeIngredientService.updateRecipeIngredient(id, body);

        return plainToInstance(ViewRecipeIngredientDto, data);
    }

    @Delete(':id')
    async deleteRecipeIngredient(@Param('id', ParseIntPipe) id: number) {
        const data = await this.recipeIngredientService.deleteRecipeIngredient(id);

        return plainToInstance(ViewRecipeIngredientDto, data);
    }
}
