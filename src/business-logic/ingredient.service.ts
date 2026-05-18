import { ConflictException, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';

import { CollectionMetadata, CollectionOptionsDto } from '@/src/domains/view-models/collection';
import { CreateIngredientDto, UpdateIngredientDto } from '@/src/domains/view-models/ingredient';
import { IngredientRepository } from '@/src/repositories/ingredient.repository';


@Injectable()
export class IngredientService {
    constructor(private readonly ingredientRepository: IngredientRepository ) {}

    getOneById(id: number){
        return this.ingredientRepository.findOne({
            where: { id },
        });
    }

    async updateIngredient(id: number, body: UpdateIngredientDto){
        await this.ingredientRepository.update( id, body)

        return this.getOneById(id);
    }

    deleteIngredient(id: number) {
        return this.ingredientRepository.softDelete( id );
    }

    async getIngredientCollection(collectionOptions: CollectionOptionsDto) {
        const whereOptions = collectionOptions?.search ? { name: ILike(`%${collectionOptions?.search}%`) } : {};

        const [items, count] = await this.ingredientRepository.findAndCount({
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

    async createIngredient(createIngredientDto: CreateIngredientDto) {
        const existingIngredient = await this.ingredientRepository.findOne({
            where: { name: createIngredientDto.name },
        });

        if (existingIngredient) {
            throw new ConflictException({
               message: `Ingredient with name "${createIngredientDto.name}" already exists`,
               entity: existingIngredient,
            });
        }

        return this.ingredientRepository.save(existingIngredient);
    }
}
