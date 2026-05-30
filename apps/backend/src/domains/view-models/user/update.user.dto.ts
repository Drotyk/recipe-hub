import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class UpdateUserDto {
    @Expose()
    @ApiPropertyOptional()
    name?: string;

    @Expose()
    @ApiPropertyOptional()
    bio?: string;

    @Expose()
    @ApiPropertyOptional()
    social?: string;
}
