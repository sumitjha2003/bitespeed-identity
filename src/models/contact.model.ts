import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("Contact")
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: "phoneNumber",
    type: "varchar", // Explicitly set type as varchar
    nullable: true,
    length: 20 // Optional length limit
  })
  phoneNumber: string | null; // Must be string type for PostgreSQL

  @Column({
    type: "varchar",
    nullable: true,
    length: 255
  })
  email: string | null;

  @Column({
    name: "linkedId",
    type: "integer", // Explicit type for numbers
    nullable: true
  })
  linkedId: number | null;

  @Column({
    name: "linkPrecedence",
    type: "varchar",
    length: 50,
    default: "primary"
  })
  linkPrecedence: "primary" | "secondary";

  @Column({
    name: "createdAt",
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP"
  })
  createdAt: Date;

  @Column({
    name: "updatedAt",
    type: "timestamp with time zone",
    default: () => "CURRENT_TIMESTAMP"
  })
  updatedAt: Date;

  @Column({
    name: "deletedAt",
    type: "timestamp with time zone",
    nullable: true
  })
  deletedAt: Date | null;
}