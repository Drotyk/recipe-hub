import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


@Exclude()
export class UpdateIngredientDto extends AbstractDto {

    @Expose()
    @ApiPropertyOptional()
    name?: string;
}
