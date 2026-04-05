import {
    Column,
    Entity, ManyToOne, OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { RecipeIngredientsEntity } from '@/src/domains/entities/recipe-ingredients.entity';
import { UserEntity } from '@/src/domains/entities/user.entity';


@Entity()
export class RecipeEntity extends AbstractEntity {

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'text' })
    text: string;

    @Column({ name: 'author_id' })
    author_id: string;

    @ManyToOne(() => UserEntity)
    author: UserEntity;

    @OneToMany(
        () => RecipeIngredientsEntity,
        (recipeIngredient) => recipeIngredient.recipeId,
    )
    recipeIngredients: RecipeIngredientsEntity[];
}
