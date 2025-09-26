// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SharedModule, ApiConfigService } from '@test-app/shared-config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    UsersModule,
    // Load envs here so they’re available at runtime (build won’t execute this)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.shared', 'apps/backend/.env', '.env'],
      expandVariables: true,
      cache: true,
    }),
    SharedModule, // must export ApiConfigService
    TypeOrmModule.forRootAsync({
      inject: [ApiConfigService],
      useFactory: (cfg: ApiConfigService) => ({
        ...cfg.mysqlConfig,
        // strongly recommended for apps using migrations:
        migrationsRun: false,      // run via CLI instead
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
  ],
})
export class AppModule { }
