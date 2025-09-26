// libs/shared-config/src/shared-config.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiConfigService } from '../api-config.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.shared', '.env', 'apps/backend/.env', 'apps/auth/.env'],
      expandVariables: true,
      cache: true,
    }),
  ],
  providers: [ApiConfigService],
  exports: [ApiConfigService, ConfigModule],
})
export class SharedModule { }
