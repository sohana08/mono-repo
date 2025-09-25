import { Controller, Get, Param, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // HTTP REST endpoints
  @Get()
  findAllHttp() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOneHttp(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Delete(':id')
  removeHttp(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // Microservice message patterns
  @MessagePattern('findAllUsers')
  findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('findOneUser')
  findOne(@Payload() id: number) {
    return this.usersService.findOne(id);
  }

  @MessagePattern('removeUser')
  remove(@Payload() id: number) {
    return this.usersService.remove(id);
  }
}
