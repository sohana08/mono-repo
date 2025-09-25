import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiConfigService } from '../api-config.service';


const providers: Provider[] = [
  ApiConfigService,
];

@Global()
@Module({
  providers,
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env.shared',
        'apps/auth/backend/.env',
        `apps/auth/backend/.env'`,
      ],      
      cache: true,
      expandVariables: true,
    }),
  ],
  exports: [...providers],
})
export class SharedModule { }


