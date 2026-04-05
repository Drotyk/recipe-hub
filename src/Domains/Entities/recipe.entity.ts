import {
    Column,
    Entity, ManyToOne, OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/src/Domains/Entities/__abstract.entity';
import { RecipeIngredientsEntity } from '@/src/Domains/Entities/recipe-ingredients.entity';
import { UserEntity } from '@/src/Domains/Entities/user.entity';


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
