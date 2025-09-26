/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { AbstractDto } from '../common/dto/abstract.dto';

type Uuid = string;

export abstract class AbstractEntity<
  DTO extends AbstractDto = AbstractDto,
  O = never,
> {
  @PrimaryGeneratedColumn('uuid')
  id!: Uuid;

  // For MySQL, 'timestamp' or 'datetime' both work. 'timestamp' is fine.
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;

  // Optional: enable soft deletes for all entities
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  toDto(options?: O): DTO {
    const dtoClass = (this as any).dtoClass as
      | (new (entity: this, options?: O) => DTO)
      | undefined;

    if (!dtoClass) {
      throw new Error(
        `Use @UseDto on ${this.constructor.name} to enable toDto()`,
      );
    }
    return new dtoClass(this, options);
  }
}
