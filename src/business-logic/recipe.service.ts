import { Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { UpdateRecipeDto } from '@/src/domains/view-models/recipe';
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
                page: collectionOptions.perPage,
                perPage: items.length,
                totalPages: Math.ceil(count / collectionOptions.perPage),
                totalItems: count,
            } as CollectionMetadata,
        }
    }
}
