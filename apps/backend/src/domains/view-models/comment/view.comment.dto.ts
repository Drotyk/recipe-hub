import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { ViewUserDto } from '@/src/domains/view-models/user';
import { ViewRecipeDto } from '@/src/domains/view-models/recipe/view.recipe.dto';


@Exclude()
export class ViewCommentDto {
    @Expose()
    @ApiProperty()
    id: number;

    @Expose()
    @ApiProperty()
    text: string;

    @Expose()
    @ApiProperty()
    recipeId: number;

    @Expose()
    @ApiProperty()
    authorId: number;

    @Expose()
    @Type(() => ViewUserDto)
    @ApiProperty()
    author: ViewUserDto;

    @Expose()
    @Type(() => ViewRecipeDto)
    @ApiProperty({ required: false })
    recipe?: ViewRecipeDto;

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
