import { Column } from 'typeorm';


export class User {
  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  email!: string;

  @Column({ nullable: false })
  abbreviation!: string;
}
