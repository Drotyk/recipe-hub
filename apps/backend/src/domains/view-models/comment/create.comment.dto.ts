import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';


@Exclude()
export class CreateCommentDto {
    @IsNotEmpty()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'Це чудовий рецепт!' })
    text: string;
}
