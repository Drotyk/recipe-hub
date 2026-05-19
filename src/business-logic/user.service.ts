import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateUserDto } from '@/src/domains/view-models/user';
import { UpdateUserDto } from '@/src/domains/view-models/user/update.user.dto';
import { UserRepository } from '@/src/repositories';


@Injectable()
export class UserService {
    constructor( private readonly userRepository: UserRepository) {}

    getOneById(id: number) {
        return this.userRepository.findOne({
            where: { id },
        });
    }

    async deleteUser(id: number) {
        await this.userRepository.softDelete( id );

        return this.getOneById(id);
    }

    createUser(body: CreateUserDto) {
        const existingUser = this.userRepository.findOne({
            where: { email: body.email },
        });

        if (existingUser) {
            throw new BadRequestException({
                message: 'User with this email already exists',
                email: body.email,
            });
        }

        const created = this.userRepository.create(body);

        return this.userRepository.save(created);
    }

    async updateUser(id: number, body: UpdateUserDto) {
        await this.userRepository.update( id, body)

        return this.getOneById(id);
    }

    async getUserCollection(collectionOptions: CollectionOptionsDto) {
        const whereOptions = collectionOptions?.search
            ? { name: ILike(`%${collectionOptions?.search}%`) }
            : {};

        const [items, count] = await this.userRepository.findAndCount({
                where: whereOptions,
                skip: (collectionOptions.page - 1) * collectionOptions.perPage,
                take: collectionOptions.perPage,
            });

        return {
            items,
            metadata: {
                page: collectionOptions.page,
                perPage: items.length,
                totalPages: Math.ceil(count / collectionOptions.perPage),
                totalItems: count,
            } as CollectionMetadata,
        }
    }
}
