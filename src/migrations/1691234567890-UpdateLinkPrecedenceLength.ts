// src/migrations/1691234567890-UpdateLinkPrecedenceLength.ts
import { MigrationInterface, QueryRunner } from "typeorm";

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