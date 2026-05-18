import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

import { BaseCollectionDto } from '@/src/domains/view-models/collection/base-collection.dto';
import { ViewUserDto } from '@/src/domains/view-models/user/view.user.dto';


@Exclude()
export class UserCollectionDto extends BaseCollectionDto<ViewUserDto> {
    @Type(() => ViewUserDto)
    @ApiProperty({ isArray: true, type: ViewUserDto })
    @Expose()
    items: ViewUserDto[];
}
