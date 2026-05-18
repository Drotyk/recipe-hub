import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { BaseCollectionDto } from '@/src/domains/view-models/collection/base-collection.dto';
import { ViewIngredientDto } from '@/src/domains/view-models/ingredient/view.ingredient.dto';


@Exclude()
export class IngredientCollectionDto extends BaseCollectionDto<ViewIngredientDto> {
    @Type(() => ViewIngredientDto)
    @ApiProperty({ isArray: true, type: ViewIngredientDto })
    @Expose()
    items: ViewIngredientDto[];
}
