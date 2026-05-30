import {
    Entity,
    Column, OneToMany,
} from 'typeorm';

import { AbstractEntity } from '@/src/domains/entities/__abstract.entity';
import { RecipeEntity } from '@/src/domains/entities/recipe.entity';


@Entity({ name: 'user' })
export class UserEntity extends AbstractEntity {

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'email' })
    email: string;

    @Column({ name: 'password' })
    password: string;

    @Column({ name: 'bio', type: 'text', nullable: true })
    bio?: string;

    @Column({ name: 'social', type: 'text', nullable: true })
    social?: string;

    @OneToMany(
        () => RecipeEntity,
        (recipe) => recipe.authorId,
    )
    recipes: RecipeEntity[];
}
