import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from '@/src/Domains/Entities/__abstract.entity';
import { IngredientEntity } from '@/src/Domains/Entities/ingredient.entity';
import { RecipeEntity } from '@/src/Domains/Entities/recipe.entity';


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
