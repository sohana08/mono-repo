import { AbstractEntity } from "../abstract.entity";

// Keep this minimal to avoid circular imports
export class AbstractDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(entity: AbstractEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      this.id = entity.id;
      this.createdAt = entity.createdAt;
      this.updatedAt = entity.updatedAt;
    }

  }
}
