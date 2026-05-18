import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { IngredientEntity } from '@/src/domains/entities';


export class ViewRecipeIngredientDto {
    @Expose()
    @ApiProperty()
    recipeId: number;

    @Expose()
    @ApiProperty()
    ingredientId: number;

    @Expose()
    @ApiProperty()
    ingredient: IngredientEntity;

    @Expose()
    @ApiProperty()
    amount: number;

    @Expose()
    @ApiProperty()
    unit: string;

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
