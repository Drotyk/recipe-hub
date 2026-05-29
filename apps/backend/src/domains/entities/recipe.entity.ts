import {
    Column,
    Entity, ManyToOne, OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { CommentEntity } from '@/src/domains/entities/comment.entity';
import { RecipeIngredientsEntity } from '@/src/domains/entities/recipe-ingredients.entity';
import { UserEntity } from '@/src/domains/entities/user.entity';


@Entity({ name: 'recipe' })
export class RecipeEntity extends AbstractEntity {

    @Column()
    name: string;

    @Column()
    text: string;

    @Column()
    authorId: number;

    @ManyToOne(() => UserEntity)
    author: UserEntity;

    @OneToMany(
        () => RecipeIngredientsEntity,
        (recipeIngredient) => recipeIngredient.recipeId,
    )
    recipeIngredients: RecipeIngredientsEntity[];

    @OneToMany(
        () => CommentEntity,
        (comment) => comment.recipe,
    )
    comments: CommentEntity[];
}
