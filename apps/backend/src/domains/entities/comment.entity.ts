import {
    Column,
    Entity,
    ManyToOne,
} from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { RecipeEntity } from '@/src/domains/entities/recipe.entity';
import { UserEntity } from '@/src/domains/entities/user.entity';


@Entity({ name: 'comment' })
export class CommentEntity extends AbstractEntity {

    @Column()
    text: string;

    @Column()
    recipeId: number;

    @Column()
    authorId: number;

    @ManyToOne(() => RecipeEntity)
    recipe: RecipeEntity;

    @ManyToOne(() => UserEntity)
    author: UserEntity;
}
