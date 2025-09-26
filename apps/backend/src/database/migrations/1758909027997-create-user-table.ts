import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUserTable1758909027997 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'banks',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar(40)',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar(100)',
                    },
                    {
                        name: 'email',
                        type: 'varchar(255)',
                    },
                    {
                        name: 'abbreviation',
                        type: 'varchar(10)',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('banks');
    }

}
