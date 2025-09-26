// Keep this minimal to avoid circular imports
export class AbstractDto {
  id!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Pick<AbstractDto, 'id' | 'createdAt' | 'updatedAt'>) {
    Object.assign(this, partial);
  }
}
