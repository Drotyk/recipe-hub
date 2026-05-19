import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ormConfig } from '@/ormconfig';
import * as entities from '@/src/domains/entities'
import * as repositories from '@/src/repositories'


const entityClasses = Object.keys(entities)
    .filter((entityName) => /\w+Entity/.test(entityName))
    .map((entityName) => entities[entityName]);

const entityProviders = Object.keys(entities)
    .filter((entityName) => /\w+Entity/.test(entityName))
    .map((entityName) => ({
        provide: entities[entityName],
        useValue: entities[entityName],
    }),
    );

const repoClasses = Object.keys(repositories)
    .filter((name) => /\w+Repository/.test(name))
    .map((name) => repositories[name]);

@Global()
@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...ormConfig,
            entities: entityClasses,
        }),
        TypeOrmModule.forFeature(entityClasses),
    ],
    providers: [
        ...repoClasses,
        ...entityProviders,
    ],
    exports: [
        TypeOrmModule.forFeature(entityClasses),
        ...repoClasses,
    ],
})
export class DbModule {}
