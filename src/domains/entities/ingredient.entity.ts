import {
    Column,
    Entity, JoinColumn, OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { RecipeIngredientsEntity } from '@/src/domains/entities/recipe-ingredients.entity';


@Entity()
export class IngredientEntity extends AbstractEntity{

    @Column({ name: 'name' })
     name: string;

    @JoinColumn({ name: 'ingredient_id' })
    @OneToMany(
        () => IngredientEntity,
        (ingredient) => ingredient.name,
    )
    recipeIngredients: RecipeIngredientsEntity[];
}
