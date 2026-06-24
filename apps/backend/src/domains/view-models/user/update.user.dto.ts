import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';


@Exclude()
export class UpdateUserDto {
    @Expose()
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    name?: string;

    @Expose()
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    bio?: string;

    @Expose()
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    social?: string;
}
