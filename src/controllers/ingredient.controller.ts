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

import { IngredientService } from '@/src/business-logic';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateIngredientDto, UpdateIngredientDto, ViewIngredientDto } from '@/src/domains/view-models/ingredient';


@ApiTags('Ingredient')
@Controller ('ingredient')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {}

    @Get('collection')
    @ApiOkResponse({ type: ViewIngredientDto })
    getCollection(@Query() collectionOptions: CollectionOptionsDto){
        return this.ingredientService.getIngredientCollection(collectionOptions);
    }

    @Get(':id')
    getIngredient(@Param('id', ParseIntPipe) id: number){
        return this.ingredientService.getOneById(id);
    }

    @Post()
    createIngredient(@Body() createIngredientDto: CreateIngredientDto){
        return this.ingredientService.createIngredient(createIngredientDto);
    }

    @Patch(':id')
    updateIngredient(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateIngredientDto,
    ) {
        return this.ingredientService.updateIngredient(id, body)
    }

    @Delete(':id')
    deleteIngredient(@Param('id', ParseIntPipe)id: number){
        return this.ingredientService.deleteIngredient(id)
    }

}
