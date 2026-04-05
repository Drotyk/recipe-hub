import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { IngredientEntity } from '@/src/domains/entities/ingredient.entity';
import { RecipeEntity } from '@/src/domains/entities/recipe.entity';


@Entity({ name: 'recipe_ingredients' })
export class RecipeIngredientsEntity extends AbstractEntity{

    @Column({ name: 'recipe_id' })
    recipeId: number;

    @JoinColumn({ name: 'recipe_id' })
    @ManyToOne(
        () => RecipeEntity,
        (recipe) => recipe.id,
    )
    recipe: RecipeEntity;

    @Column({ name: 'ingredient_id' })
    ingredientId: number;

    @JoinColumn({ name: 'ingredient_id' })
    @ManyToOne(
        () => IngredientEntity,
        (ingredient) => ingredient.id,
    )
    ingredient: IngredientEntity;

    @Column({ name: 'ingredient_name' })
    amount: number;

    @Column({ name: 'ingredient_description' })
    unit: string;

}
