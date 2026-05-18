import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';

import { UserService } from '@/src/business-logic/user.service';
import { CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateUserDto, ViewUserDto } from '@/src/domains/view-models/user';
import { UpdateUserDto } from '@/src/domains/view-models/user/update.user.dto';


@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('collection')
    @ApiOkResponse({ type: ViewUserDto })
    getCollection(@Query() collectionOptions: CollectionOptionsDto) {
        return this.userService.getUserCollection(collectionOptions);
    }

    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.getOneById(id);

        return plainToInstance(ViewUserDto, user);
    }

    @Post()
    createUser(@Body() body: CreateUserDto) {
        return this.userService.createUser(body);
    }

    @Patch(':id')
    updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, body)
    }

    @Delete(':id')
    deleteUser(@Param('id', ParseIntPipe)id: number) {
        return this.userService.deleteUser(id)
    }
}
