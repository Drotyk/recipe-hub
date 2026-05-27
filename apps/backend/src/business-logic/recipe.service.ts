import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { UserEntity } from '@/src/domains/entities';
import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateRecipeDto, UpdateRecipeDto } from '@/src/domains/view-models/recipe';
import { RecipeRepository } from '@/src/repositories/recipe.repository';


@Injectable()
export class RecipeService {
    constructor(private readonly recipeRepository: RecipeRepository) {}

    getOneById(id: number) {
        return this.recipeRepository.findOne({
            where: { id },
        });
    }

    async updateRecipe(id: number, body: UpdateRecipeDto) {
        await this.recipeRepository.update(id, body);

        return this.getOneById(id);
    }

    deleteRecipe(id: number) {
        return this.recipeRepository.softDelete(id);
    }
    async getRecipeCollection(collectionOptions: CollectionOptionsDto) {
        const whereOptions = collectionOptions?.search ? { name: ILike(`%${collectionOptions?.search}%`) } : {};

        const [items, count] = await this.recipeRepository.findAndCount({
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

    async createRecipe(body: CreateRecipeDto) {
        const authorUser = await this.recipeRepository
            .manager
            .getRepository(UserEntity)
            .findOne({ where: { id: body.authorId } });

        if (!authorUser) {
            throw new BadRequestException({
                message: 'User with id = authorId was not found',
                authorId: body.authorId,
            });
        }

        return this.recipeRepository.save(body);
    }
}
