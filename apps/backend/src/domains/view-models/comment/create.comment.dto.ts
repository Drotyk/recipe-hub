import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNotEmpty, Min } from 'class-validator';


@Exclude()
export class CreateCommentDto {
    @IsNotEmpty()
    @Type(() => String)
    @Expose()
    @ApiProperty({ example: 'Це чудовий рецепт!' })
    text: string;

    @Min(1)
    @Type(() => Number)
    @Expose()
    @ApiProperty({ example: 1 })
    authorId: number;
}
