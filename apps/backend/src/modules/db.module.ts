import { Global, Module, Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ormConfig } from '@/ormconfig';
import * as entities from '@/src/domains/entities';
import * as repositories from '@/src/repositories';


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const entitiesMap = entities as Record<string, Function>;
const repositoriesMap = repositories as Record<string, Provider>;

const entityClasses = Object.keys(entitiesMap)
    .filter((entityName) => /\w+Entity/.test(entityName))
    .map((entityName) => entitiesMap[entityName]);

const entityProviders = Object.keys(entitiesMap)
    .filter((entityName) => /\w+Entity/.test(entityName))
    .map((entityName) => ({
        provide: entitiesMap[entityName],
        useValue: entitiesMap[entityName],
    }));

const repoClasses = Object.keys(repositoriesMap)
    .filter((name) => /\w+Repository/.test(name))
    .map((name) => repositoriesMap[name]);

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
