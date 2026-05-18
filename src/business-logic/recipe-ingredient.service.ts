import { BadRequestException, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { IngredientEntity, RecipeEntity } from '@/src/domains/entities';
import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateRecipeIngredientsDto, UpdateRecipeIngredientsDto } from '@/src/domains/view-models/recipe-ingredients';
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
                page: collectionOptions.page,
                perPage: items.length,
                totalPages: Math.ceil(count / items.length),
                totalItems: count,
            } as CollectionMetadata,
        }
    }

    async createRecipeIngredient(createRecipeIngredientDto: CreateRecipeIngredientsDto) {
        const existingRecipe = await this.recipeIngredientsRepository.manager
            .getRepository(RecipeEntity)
            .findOne({ where: { id: createRecipeIngredientDto.recipeId } });

        if (!existingRecipe) {
            throw new BadRequestException({
                message: 'Recipe with id = recipeId was not found',
                recipeId: createRecipeIngredientDto.recipeId,
            });
        }

        const existingIngredient = await this.recipeIngredientsRepository.manager
            .getRepository(IngredientEntity)
            .findOne({ where: { id: createRecipeIngredientDto.ingredientId } });

        if (!existingIngredient) {
            throw new BadRequestException({
                message: 'Ingredient with id = ingredientId was not found',
                ingredientId: createRecipeIngredientDto.ingredientId,
            });
        }


        return this.recipeIngredientsRepository.save(createRecipeIngredientDto);
    }
}
