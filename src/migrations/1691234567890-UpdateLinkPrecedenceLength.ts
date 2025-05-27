// src/migrations/1691234567890-UpdateLinkPrecedenceLength.ts
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContactTable1690000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "Contact" (
                "id" SERIAL PRIMARY KEY,
                "phoneNumber" VARCHAR(20),
                "email" VARCHAR(255),
                "linkedId" INTEGER,
                "linkPrecedence" VARCHAR(10) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "Contact"`);
    }
}
export class UpdateLinkPrecedenceLength1691234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Contact" 
      ALTER COLUMN "linkPrecedence" TYPE VARCHAR(10)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "Contact" 
      ALTER COLUMN "linkPrecedence" TYPE VARCHAR(8)
    `);
  }
}