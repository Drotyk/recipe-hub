import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, Repository } from 'typeorm';

import { RecipeIngredientsEntity } from '@/src/domains/entities';


@Injectable()
export class RecipeIngredientsRepository extends Repository<RecipeIngredientsEntity> {
    constructor(
        @Inject(RecipeIngredientsEntity) entityTarget: EntityTarget<RecipeIngredientsEntity>,
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        super(entityTarget, entityManager)
    }
}
