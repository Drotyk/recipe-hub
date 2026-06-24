import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';

import { UserEntity } from '@/src/domains/entities';
import { IJwtUserInfo } from '@/src/common/interfaces';
import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateRecipeDto, UpdateRecipeDto } from '@/src/domains/view-models/recipe';
import { RecipeRepository } from '@/src/repositories/recipe.repository';


@Injectable()
export class RecipeService {
    constructor(private readonly recipeRepository: RecipeRepository) { }

    getOneById(id: number) {
        return this.recipeRepository.findOne({
            where: { id },
            relations: {
                author: true,
            },
        });
    }

    /**
     * @ai-context Центральна перевірка прав на зміну рецепта.
     * Звичайний користувач може змінювати тільки власні рецепти, admin - будь-які.
     * Використовуй цей guard перед update/delete та перед майбутніми діями, що змінюють рецепт.
     */
    private async assertRecipeOwner(id: number, currentUser: IJwtUserInfo) {
        const recipe = await this.recipeRepository.findOne({
            where: { id },
        });

        if (!recipe) {
            throw new NotFoundException({
                message: 'Recipe was not found',
                id,
            });
        }

        if (!currentUser.isAdmin && recipe.authorId !== currentUser.id) {
            throw new ForbiddenException('You can only modify your own recipes');
        }

        return recipe;
    }

    async updateRecipe(id: number, body: UpdateRecipeDto, currentUser: IJwtUserInfo) {
        await this.assertRecipeOwner(id, currentUser);

        await this.recipeRepository.update(id, body);

        return this.getOneById(id);
    }

    async deleteRecipe(id: number, currentUser: IJwtUserInfo) {
        const recipe = await this.assertRecipeOwner(id, currentUser);

        await this.recipeRepository.softDelete(id);

        return recipe;
    }
    /**
     * @ai-context Колекції у frontend очікують стабільний формат `{ items, metadata }`.
     * Пошук зараз виконується тільки по назві рецепта; при розширенні пошуку онови frontend типи/фільтри.
     */
    async getRecipeCollection(collectionOptions: CollectionOptionsDto) {
        const whereOptions = collectionOptions?.search ? { name: ILike(`%${collectionOptions?.search}%`) } : {};

        const [items, count] = await this.recipeRepository.findAndCount({
            where: whereOptions,
            skip: (collectionOptions.page - 1) * collectionOptions.perPage,
            take: collectionOptions.perPage,
            relations: {
                author: true,
            },
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
     * @ai-context Рецепт завжди створюється від імені authenticated user.
     * `authorId` не береться з DTO, щоб клієнт не міг створити рецепт за іншого користувача.
     */
    async createRecipe(body: CreateRecipeDto, authorId: number) {
        const authorUser = await this.recipeRepository
            .manager
            .getRepository(UserEntity)
            .findOne({ where: { id: authorId } });

        if (!authorUser) {
            throw new BadRequestException({
                message: 'Authenticated user was not found',
                authorId,
            });
        }

        const createdRecipe = await this.recipeRepository.save({
            ...body,
            authorId,
        });

        return this.getOneById(createdRecipe.id);
    }
}
