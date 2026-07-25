import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';

import { IJwtUserInfo } from '@/src/common/interfaces';
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

    async updateRecipe(id: number, body: UpdateRecipeDto, currentUser: IJwtUserInfo) {
        const recipe = await this.getOneById(id);

        if (!recipe) {
            throw new NotFoundException({ message: 'Recipe was not found', id });
        }
        if (recipe.authorId !== currentUser.id && !currentUser.isAdmin) {
            throw new ForbiddenException({ message: 'You are not allowed to update this recipe' });
        }

        await this.recipeRepository.update(id, body);

        return this.getOneById(id);
    }

    async deleteRecipe(id: number, currentUser: IJwtUserInfo) {
        const recipe = await this.getOneById(id);

        if (!recipe) {
            throw new NotFoundException({ message: 'Recipe was not found', id });
        }
        if (recipe.authorId !== currentUser.id && !currentUser.isAdmin) {
            throw new ForbiddenException({ message: 'You are not allowed to delete this recipe' });
        }

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

    async createRecipe(body: CreateRecipeDto, currentUser: IJwtUserInfo) {
        return this.recipeRepository.save({
            ...body,
            authorId: currentUser.id,
        });
    }
}
