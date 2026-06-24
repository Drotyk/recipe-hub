import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


export class UpdateRecipeDto extends AbstractDto {
    @ApiProperty()
    @Expose()
    @IsOptional()
    @IsString()
    text?: string;
}
