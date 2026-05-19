import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { BaseCollectionDto } from '@/src/domains/view-models/collection/base-collection.dto';
import { ViewRecipeIngredientDto } from '@/src/domains/view-models/recipe-ingredients/view.recipe-ingredient.dto';


@Exclude()
export class CollectionRecipeIngredientsDto extends BaseCollectionDto<ViewRecipeIngredientDto> {
    @Type(() => ViewRecipeIngredientDto)
    @ApiProperty({ isArray: true, type: ViewRecipeIngredientDto })
    @Expose()
    items: ViewRecipeIngredientDto[];
}
