import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class UpdateRecipeIngredientsDto {
    @Expose()
    @ApiPropertyOptional()
    recipeId?: number;

    @Expose()
    @ApiPropertyOptional()
    ingredientId?: number;

    @Expose()
    @ApiPropertyOptional()
    amount?: number;

    @Expose()
    @ApiPropertyOptional()
    unit?: string;
}
