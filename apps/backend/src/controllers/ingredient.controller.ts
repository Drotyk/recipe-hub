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

import { IngredientService } from '@/src/business-logic';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import {
    CollectionIngredientDto,
    CreateIngredientDto,
    UpdateIngredientDto,
    ViewIngredientDto,
} from '@/src/domains/view-models/ingredient';


@ApiTags('Ingredient')
@Controller ('ingredient')
export class IngredientController {
    constructor(private readonly ingredientService: IngredientService) {}

    @Get('collection')
    @ApiOkResponse({ type: CollectionIngredientDto })
  async getCollection(@Query() collectionOptions: CollectionOptionsDto) {
        const data = await this.ingredientService.getIngredientCollection(collectionOptions);

        return plainToInstance(CollectionIngredientDto, data);
    }

    @Get(':id')
    async getIngredient (@Param('id', ParseIntPipe) id: number){
        const data = await this.ingredientService.getOneById(id);

        return plainToInstance(ViewIngredientDto, data);
    }

    @Post()
    async createIngredient(@Body() createIngredientDto: CreateIngredientDto){
        const data = await this.ingredientService.createIngredient(createIngredientDto);

        return plainToInstance(ViewIngredientDto, data);
    }

    @Patch(':id')
    async updateIngredient(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateIngredientDto,
    ) {
        const data = await this.ingredientService.updateIngredient(id, body)

        return plainToInstance(ViewIngredientDto, data);
    }

    @Delete(':id')
     async deleteIngredient(@Param('id', ParseIntPipe)id: number){
        const data = await this.ingredientService.deleteIngredient(id)

        return plainToInstance(ViewIngredientDto, data);
    }

}
