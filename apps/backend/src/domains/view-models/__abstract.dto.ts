import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';


@Exclude()
export class AbstractDto {
    @Expose()
    @ApiProperty()
    id!: number;

    @Expose()
    @ApiProperty()
    createdAt!: Date;

    @Expose()
    @ApiProperty()
    updatedAt!: Date;

    @Expose()
    @ApiProperty()
    deletedAt!: Date;
}
