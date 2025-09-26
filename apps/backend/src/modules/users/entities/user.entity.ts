import { Column, Entity, Index } from 'typeorm';
import { BankDto } from '../dto/bank.dto';
import { AbstractEntity, UseDto } from '@test-app/shared-config';

@Entity('banks')
@UseDto(BankDto)
export class BankEntity extends AbstractEntity<BankDto> {
  @Index({ unique: true })
  @Column({ length: 20 })
  swiftCode!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 3 })
  countryCode!: string; // e.g., "BTN"
}
