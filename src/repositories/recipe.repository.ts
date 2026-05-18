import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, Repository } from 'typeorm';

import { RecipeEntity } from '@/src/domains/entities';


@Injectable()
export class RecipeRepository extends Repository<RecipeEntity>{
    constructor(
        @Inject(RecipeEntity) entityTarget: EntityTarget<RecipeEntity>,
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        super(entityTarget, entityManager)
    }
}
