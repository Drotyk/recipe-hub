import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, Repository } from 'typeorm';

import { UserEntity } from '../domains/entities';


@Injectable()
export class UserRepository extends Repository<UserEntity>{
    constructor(
        @Inject(UserEntity) entityTarget: EntityTarget<UserEntity>,
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        super(entityTarget, entityManager)
    }
}
