import { MigrationInterface, QueryRunner } from 'typeorm';


export class CreateUserTable1774360675071 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
        `CREATE TABLE "user"(
            id serial PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP,
            name VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL,
            password VARCHAR(512) NOT NULL,
            UNIQUE (email)
        );
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE "user"');
    }

}
