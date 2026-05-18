import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class CreateIngredientDto {
    @Expose()
    @ApiPropertyOptional()
    name: string;
}
