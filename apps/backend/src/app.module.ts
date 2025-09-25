import { Module } from '@nestjs/common';
import { SharedModule } from '@test-app/shared-config';
import { UsersModule } from './modules/users/users.module';


@Module({
  imports: [SharedModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
