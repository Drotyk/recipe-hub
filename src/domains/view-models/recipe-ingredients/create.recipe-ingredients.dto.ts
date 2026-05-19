import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';


@Exclude()
export class CreateRecipeIngredientsDto {
    @Min(1)
    @Type(() => Number)
    @Expose()
    @ApiProperty()
    recipeId: number;

    @Min(1)
    @Type(() => Number)
    @Expose()
    @ApiProperty()
    ingredientId: number;

    @Min(0.000001)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Type(() => Number)
    @Expose()
    @ApiProperty()
    amount: number;

    @IsNotEmpty()
    @IsString()
    @Type(() => String)
    @Expose()
    @ApiProperty()
    unit: string;
}
