import {
    Column,
    Entity, OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { RecipeIngredientsEntity } from '@/src/domains/entities/recipe-ingredients.entity';


@Entity({ name: 'ingredient' })
export class IngredientEntity extends AbstractEntity{

    @Column()
     name: string;

    @OneToMany(
        () => RecipeIngredientsEntity,
        (recipeIngredients) => recipeIngredients.ingredient,
    )
    recipeIngredients: RecipeIngredientsEntity[];
}
