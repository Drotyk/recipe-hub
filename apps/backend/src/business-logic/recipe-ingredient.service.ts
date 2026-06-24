import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { FindOptionsWhere, ILike } from 'typeorm';

import { IngredientEntity, RecipeEntity } from '@/src/domains/entities';
import { IJwtUserInfo } from '@/src/common/interfaces';
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

    /**
     * @ai-context Зв'язок recipe-ingredient змінює склад конкретного рецепта.
     * Тому права перевіряються через власника рецепта, а не через автора інгредієнта.
     */
    private async assertRecipeOwner(recipeId: number, currentUser: IJwtUserInfo) {
        const recipe = await this.recipeIngredientsRepository.manager
            .getRepository(RecipeEntity)
            .findOne({ where: { id: recipeId } });

        if (!recipe) {
            throw new BadRequestException({
                message: 'Recipe with id = recipeId was not found',
                recipeId,
            });
        }

        if (!currentUser.isAdmin && recipe.authorId !== currentUser.id) {
            throw new ForbiddenException('You can only modify ingredients for your own recipes');
        }

        return recipe;
    }

    /**
     * @ai-context При зміні recipeId потрібно перевірити права і на старий, і на новий рецепт.
     * Інакше користувач міг би перенести ingredient row до чужого рецепта.
     */
    async updateRecipeIngredient(id: number, body: UpdateRecipeIngredientsDto, currentUser: IJwtUserInfo) {
        const existingRecipeIngredient = await this.recipeIngredientsRepository.findOne({
            where: { id },
        });

        if (!existingRecipeIngredient) {
            throw new NotFoundException({
                message: 'Recipe ingredient was not found',
                id,
            });
        }

        await this.assertRecipeOwner(existingRecipeIngredient.recipeId, currentUser);

        if (body.recipeId && body.recipeId !== existingRecipeIngredient.recipeId) {
            await this.assertRecipeOwner(body.recipeId, currentUser);
        }

        await this.recipeIngredientsRepository.update(id, body);

        return this.getOneById(id);
    }

    async deleteRecipeIngredient(id: number, currentUser: IJwtUserInfo) {
        const existingRecipeIngredient = await this.recipeIngredientsRepository.findOne({
            where: { id },
        });

        if (!existingRecipeIngredient) {
            throw new NotFoundException({
                message: 'Recipe ingredient was not found',
                id,
            });
        }

        await this.assertRecipeOwner(existingRecipeIngredient.recipeId, currentUser);

        await this.recipeIngredientsRepository.softDelete(id);

        return existingRecipeIngredient;
    }

    /**
     * @ai-context Колекція підтримує фільтри `recipeId` і `ingredientId`, бо frontend
     * використовує цей endpoint і для сторінки складу рецепта, і для пошуку за інгредієнтами.
     */
    async getRecipeIngredientCollection(collectionOptions: CollectionOptionsDto){
        const baseFilter: FindOptionsWhere<any> = {};

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

    /**
     * @ai-context Перед створенням перевіряємо власника рецепта і існування інгредієнта.
     * Це захищає від записів recipe_ingredients з невалідними зовнішніми ключами на рівні бізнес-логіки.
     */
    async createRecipeIngredient(
        createRecipeIngredientDto: CreateRecipeIngredientsDto,
        currentUser: IJwtUserInfo,
    ) {
        await this.assertRecipeOwner(createRecipeIngredientDto.recipeId, currentUser);

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
