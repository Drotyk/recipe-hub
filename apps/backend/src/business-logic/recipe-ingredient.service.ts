import { BadRequestException, Injectable } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';

import { IJwtUserInfo } from '@/src/common/interfaces';
import { IngredientEntity, RecipeEntity, RecipeIngredientsEntity } from '@/src/domains/entities';
import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateRecipeIngredientsDto, UpdateRecipeIngredientsDto } from '@/src/domains/view-models/recipe-ingredients';
import { RecipeIngredientsRepository } from '@/src/repositories/recipe-ingredients.repository';


@Injectable()
export class RecipeIngredientService {
    constructor(private readonly recipeIngredientsRepository: RecipeIngredientsRepository) {}

    getOneById(id: number) {
        return this.recipeIngredientsRepository.findOne({
            where: { id },
            relations: ['recipe', 'ingredient'],
        });
    }

    async updateRecipeIngredient(id: number, body: UpdateRecipeIngredientsDto, currentUser?: IJwtUserInfo) {
        await this.recipeIngredientsRepository.update(id, body);

        return this.getOneById(id);
    }

    async deleteRecipeIngredient(id: number, currentUser?: IJwtUserInfo) {
        await this.recipeIngredientsRepository.softDelete(id);

        return this.getOneById(id);
    }

    async getRecipeIngredientCollection(collectionOptions: CollectionOptionsDto){
        const baseFilter: FindOptionsWhere<RecipeIngredientsEntity> = {};

        if (collectionOptions.recipeId) {
            baseFilter.recipeId = collectionOptions.recipeId;
        }
        if (collectionOptions.ingredientId) {
            baseFilter.ingredientId = collectionOptions.ingredientId;
        }

        const whereOptions =
            collectionOptions?.search
             ? [
                 { ...baseFilter, recipe: { name: ILike(`%${collectionOptions?.search}%`) } },
                 { ...baseFilter, ingredient: { name: ILike(`%${collectionOptions?.search}%`) } },
                ]
             : baseFilter;

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
                totalPages: Math.ceil(count / collectionOptions.perPage),
                totalItems: count,
            } as CollectionMetadata,
        }
    }

    async createRecipeIngredient(createRecipeIngredientDto: CreateRecipeIngredientsDto, currentUser?: IJwtUserInfo) {
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
