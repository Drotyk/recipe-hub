import { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateCommentTable1780055990076 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "comment"(
            id serial PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            text TEXT NOT NULL,
            recipe_id INTEGER NOT NULL,
            author_id INTEGER NOT NULL,
            CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES "recipe"(id) ON DELETE CASCADE,
            CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE CASCADE
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "comment"');
    }

}
