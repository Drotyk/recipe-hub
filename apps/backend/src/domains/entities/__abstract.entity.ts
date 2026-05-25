import {
    BaseEntity,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';


@Entity()
export class AbstractEntity extends BaseEntity{

    @PrimaryGeneratedColumn({ name: 'id' })
    id:number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt:Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt:Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt:Date;
}
