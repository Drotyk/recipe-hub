import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';


@Exclude()
export class CreateIngredientDto {
    @IsNotEmpty()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'potato' })
    name: string;
}
