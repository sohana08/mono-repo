import { BankEntity } from '../entities/user.entity';
import {
  AbstractDto
} from '@test-app/shared-config';

export class BankDto extends AbstractDto {
  name!: string;
  swiftCode!: string;
  countryCode!: string;

  constructor(entity: BankEntity) {
    super(entity);
    this.name = entity.name;
    this.swiftCode = entity.swiftCode;
    this.countryCode = entity.countryCode;
  }
}
