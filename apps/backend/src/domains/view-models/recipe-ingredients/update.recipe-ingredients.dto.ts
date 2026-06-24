import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';


@Exclude()
export class UpdateRecipeIngredientsDto {
    @Expose()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    @ApiPropertyOptional()
    recipeId?: number;

    @Expose()
    @IsOptional()
    @Min(1)
    @Type(() => Number)
    @ApiPropertyOptional()
    ingredientId?: number;

    @Expose()
    @IsOptional()
    @Min(0.000001)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Type(() => Number)
    @ApiPropertyOptional()
    amount?: number;

    @Expose()
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    unit?: string;
}
