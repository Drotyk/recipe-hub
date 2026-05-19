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
import { CollectionUserDto, CreateUserDto, UpdateUserDto, ViewUserDto } from '@/src/domains/view-models/user';


@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('collection')
    @ApiOkResponse({ type: CollectionUserDto })
    async getCollection(@Query() collectionOptions: CollectionOptionsDto) {
        const data = await this.userService.getUserCollection(collectionOptions);

        return plainToInstance(CollectionUserDto, data);
    }

    @Get(':id')
    async getUser(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.getOneById(id);

        return plainToInstance(ViewUserDto, user);
    }

    @Post()
    async createUser(@Body() body: CreateUserDto) {
        const user = await this.userService.createUser(body);

        return plainToInstance(ViewUserDto, user);
    }

    @Patch(':id')
   async updateUser(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateUserDto,
    ) {
        const user= await this.userService.updateUser(id, body)

        return plainToInstance(ViewUserDto, user);
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe)id: number) {
        const user = await this.userService.deleteUser(id)

        return plainToInstance(ViewUserDto, user);
    }
}
