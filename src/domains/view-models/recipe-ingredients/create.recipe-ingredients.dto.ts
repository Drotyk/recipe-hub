import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class CreateRecipeIngredientsDto {
    @Expose()
    @ApiProperty()
    recipeId: number;

    @Expose()
    @ApiProperty()
    ingredientId: number;

    @Expose()
    @ApiProperty()
    amount: number;

    @Expose()
    @ApiProperty()
    unit: string;
}
