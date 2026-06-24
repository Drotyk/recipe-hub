import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


@Exclude()
export class UpdateIngredientDto extends AbstractDto {

    @Expose()
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    name?: string;
}
