import { Inject, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, Repository } from 'typeorm';

import { CommentEntity } from '../domains/entities';


@Injectable()
export class CommentRepository extends Repository<CommentEntity>{
    constructor(
        @Inject(CommentEntity) entityTarget: EntityTarget<CommentEntity>,
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        super(entityTarget, entityManager)
    }
}
