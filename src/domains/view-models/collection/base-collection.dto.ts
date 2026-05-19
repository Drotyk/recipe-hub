import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


export type CollectionMetadata = {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
}

@Exclude()
export class BaseCollectionDto<T> {
    @Expose()
    @ApiProperty({ isArray: true })
    items: T[];

    @Expose()
    @ApiProperty()
    metadata: CollectionMetadata;
}
