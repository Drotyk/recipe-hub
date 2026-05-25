import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


export class UpdateRecipeDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    text?: string;
}
