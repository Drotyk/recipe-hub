import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


@Exclude()
export class ViewIngredientDto extends AbstractDto {
    @Expose()
    @ApiProperty()
    name: string;
}
