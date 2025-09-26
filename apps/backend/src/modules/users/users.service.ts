import { Injectable } from '@nestjs/common';
import { BankPageOptionsDto } from './dto/bank-page-options.dto';
import { BankDto } from './dto/bank.dto';
import {
  PageDto
} from '@test-app/shared-config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankEntity } from './entities/user.entity';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(BankEntity)
    private bankRepository: Repository<BankEntity>,
  ) { }
  // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }

  findAll() {
    return `This action returns all users`;
  }

  async getUsers(
    pageOptionsDto: BankPageOptionsDto,
  ): Promise<PageDto<BankDto>> {
    const queryBuilder = this.bankRepository.createQueryBuilder('bank');
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
