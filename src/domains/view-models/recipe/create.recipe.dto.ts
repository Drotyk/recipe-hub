import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


export class CreateRecipeDto extends AbstractDto{
    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty()
    text: string

    @Expose()
    @ApiProperty()
    author_id: string
}
