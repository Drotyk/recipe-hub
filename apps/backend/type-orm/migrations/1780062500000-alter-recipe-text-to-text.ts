// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { MigrationInterface, QueryRunner } from 'typeorm';


export class AlterRecipeTextToText1780062500000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "recipe" ALTER COLUMN "text" TYPE TEXT;');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "recipe" ALTER COLUMN "text" TYPE VARCHAR(200);');
    }

}
