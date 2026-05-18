import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { ViewRecipeIngredientDto } from '@/src/domains/view-models/recipe-ingredients/view.recipe-ingredient.dto';
import { ViewUserDto } from '@/src/domains/view-models/user';


@Exclude()
export class ViewRecipeDto {
    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty()
    text: string;

    @Expose()
    @ApiProperty()
    author_id: string;

    @Expose()
    @Type(() => ViewUserDto)
    @ApiProperty()
    author: ViewUserDto;

    @Expose()
    @ApiPropertyOptional()
    recipeIngredients?: ViewRecipeIngredientDto[] | null;

    @Expose()
    @ApiProperty()
    id: number;

    @Expose()
    @ApiProperty()
    createdAt: Date;

    @Expose()
    @ApiProperty()
    updatedAt: Date;

    @Expose()
    @ApiProperty()
    deletedAt: Date;
}
