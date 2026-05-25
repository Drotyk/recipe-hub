// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { MigrationInterface, QueryRunner } from 'typeorm';


export class RecipeFixTypoInColumnName1775320527007 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
         await queryRunner.query('ALTER TABLE "recipe" RENAME COLUMN "texte" TO "text";')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "recipe" RENAME COLUMN "text" TO "texte";')
    }

}
