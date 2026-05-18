import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class CollectionOptionsDto {
    @Expose()
    @ApiProperty()
    page: number;

    @Expose()
    @ApiProperty()
    perPage: number;

    @Expose()
    @ApiPropertyOptional()
    search!: string;
}
