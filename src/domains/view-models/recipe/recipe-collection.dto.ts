import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { BaseCollectionDto } from '@/src/domains/view-models/collection/base-collection.dto';
import { ViewRecipeDto } from '@/src/domains/view-models/recipe/view.recipe.dto';


@Exclude()
export class RecipeCollectionDto extends BaseCollectionDto<ViewRecipeDto> {
    @Type(() => ViewRecipeDto)
    @ApiProperty({ isArray: true, type: ViewRecipeDto })
    @Expose()
    items: ViewRecipeDto[];
}
