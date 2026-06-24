import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';


@Exclude()
export class CreateRecipeDto {
    @IsNotEmpty()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'Pancakes' })
    name: string;

    @IsNotEmpty()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: '1) take the pan. 2) make the pancakes' })
    text: string

}
