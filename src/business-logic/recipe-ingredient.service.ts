import { Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { UpdateRecipeIngredientsDto } from '@/src/domains/view-models/recipe-ingredients';
import { RecipeIngredientsRepository } from '@/src/repositories/recipe-ingredients.repository';


@Injectable()
export class RecipeIngredientService {
    constructor(private readonly recipeIngredientsRepository: RecipeIngredientsRepository) {}

    getOneById(id: number) {
        return this.recipeIngredientsRepository.findOne({
            where: { id },
        });
    }

    async updateRecipeIngredient(id: number, body: UpdateRecipeIngredientsDto) {
        await this.recipeIngredientsRepository.update(id, body);

        return this.getOneById(id);
    }

    deleteRecipeIngredient(id: number) {
        return this.recipeIngredientsRepository.softDelete(id);
    }

    async getRecipeIngredientCollection(collectionOptions: CollectionOptionsDto){
        const whereOptions =
            collectionOptions?.search
             ? [
                 { recipe: { name: ILike(`%${collectionOptions?.search}%`) } },
                 { ingredient: { name: ILike(`%${collectionOptions?.search}%`) } },
                ]
             : {};

        const [items, count] = await this.recipeIngredientsRepository.findAndCount({
            where: whereOptions,
            relations: ['recipe', 'ingredient'],
            skip: (collectionOptions.page - 1) * collectionOptions.perPage,
            take: collectionOptions.perPage,
        });

        return {
            items,
            metadata: {
                page: collectionOptions.perPage,
                perPage: items.length,
                totalPages: Math.ceil(count / items.length),
                totalItems: count,
            } as CollectionMetadata,
        }
    }
}
