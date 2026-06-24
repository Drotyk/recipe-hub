import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

import { AbstractDto } from '@/src/domains/view-models/__abstract.dto';


@Exclude()
export class ViewUserDto extends AbstractDto {
    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiProperty({ required: false })
    bio?: string;

    @Expose()
    @ApiProperty({ required: false })
    social?: string;
}
