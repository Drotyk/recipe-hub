import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { IngredientEntity } from '@/src/domains/entities/ingredient.entity';
import { RecipeEntity } from '@/src/domains/entities/recipe.entity';


@Entity({ name: 'recipe_ingredients' })
export class RecipeIngredientsEntity extends AbstractEntity{

    @Column()
    recipeId: number;

    @JoinColumn()
    @ManyToOne(
        () => RecipeEntity,
        (recipe) => recipe.id,
    )
    recipe: RecipeEntity;

    @Column()
    ingredientId: number;

    @JoinColumn()
    @ManyToOne(
        () => IngredientEntity,
        (ingredient) => ingredient.id,
    )
    ingredient: IngredientEntity;

    @Column()
    amount: number;

    @Column()
    unit: string;

}
