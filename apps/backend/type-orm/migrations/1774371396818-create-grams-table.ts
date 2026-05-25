// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateGramsTable1774371396818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "grams"(
            id serial PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            recipe_id INTEGER NOT NULL,
            ingredient_id INTEGER NOT NULL,
            grams INTEGER NOT NULL,
            CONSTRAINT fk_recipe FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
            CONSTRAINT fk_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON DELETE CASCADE
        );`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "grams"');
    }

}
