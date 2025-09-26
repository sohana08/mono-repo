import { BankEntity } from '../entities/user.entity';
import {
  AbstractDto
} from '@test-app/shared-config';

export class BankDto extends AbstractDto {
  name!: string;
  email!: string;
  abbreviation!: string;

  constructor(entity: BankEntity) {
    super(entity);
    this.name = entity.name;
    this.email = entity.email;
    this.abbreviation = entity.abbreviation;
  }
}
