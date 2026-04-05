// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateRecipeTable1774370649025 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recipe"(
            id serial PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            recipe_name VARCHAR(200) NOT NULL,
            text VARCHAR(200) NOT NULL,
            author_id INTEGER NOT NULL,
            CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES "user"(id) ON DELETE CASCADE,
            UNIQUE (recipe_name)
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "recipe"');
    }

}
