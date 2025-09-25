import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiConfigService } from '../api-config.service';

const providers: Provider[] = [
  ApiConfigService,
];

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        // App-specific env files (higher priority)
        'apps/auth/.env',
        'apps/backend/.env',
        // Shared env file (lower priority - fallback)
        '.env.shared',
      ],
      cache: true,
      expandVariables: true,
    }),
    // Comment out TypeORM temporarily to debug
    // TypeOrmModule.forRootAsync({
    //   useFactory: (apiConfigService: ApiConfigService) => {
    //     return apiConfigService.mysqlConfig;
    //   },
    //   inject: [ApiConfigService],
    // }),
  ],
  providers,
  exports: [...providers],
})
export class SharedModule { }


