import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';


@Exclude()
export class CollectionOptionsDto {
    @Expose()
    @Min(1)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Type(() => Number)
    @ApiProperty({ default: 1 })
    page: number;

    @Expose()
    @Min(1)
    @IsNumber({ allowNaN: false, allowInfinity: false })
    @Type(() => Number)
    @ApiProperty({ default: 1 })
    perPage: number;

    @Expose()
    @IsString()
    @IsOptional()
    @ApiPropertyOptional()
    search?: string;
}
