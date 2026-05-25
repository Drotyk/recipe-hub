import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, Repository } from 'typeorm';

import { IngredientEntity } from '@/src/domains/entities';


@Injectable()
export class IngredientRepository extends Repository<IngredientEntity> {
    constructor(
        @Inject(IngredientEntity) entityTarget: EntityTarget<IngredientEntity>,
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        super(entityTarget, entityManager)
    }
}
