import {
  HttpStatus,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  ExpressAdapter,
  type NestExpressApplication,
} from '@nestjs/platform-express';
import compression from 'compression';
import { middleware as expressCtx } from 'express-ctx';
// import rateLimit from 'express-rate-limit';
// import helmet from 'helmet';
import morgan from 'morgan';
import { initializeTransactionalContext } from 'typeorm-transactional';

import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import { 
  HttpExceptionFilter, 
  QueryFailedFilter 
} from '@test-app/shared-config';

export async function bootstrap(): Promise<NestExpressApplication> {
  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );
  app.setGlobalPrefix('/svc'); //use api as global prefix if you don't have subdomain
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  // const configService = app.select(SharedModule).get(ApiConfigService);

  // const transportPort = configService.tcpTransportPort;
  // app.connectMicroservice({
  //   transport: Transport.TCP,
  //   options: { host: '0.0.0.0', port: transportPort.port },
  // });

  // await app.startAllMicroservices();

  // if (configService.documentationEnabled) {
  //   setupSwagger(app);
  // }

  app.use(expressCtx);

  // const port = configService.app.port;
  const port = 3020;

  // Enable Swagger documentation
  setupSwagger(app, port);

  // Starts listening for shutdown hooks
  // if (!configService.isDevelopment) {
  //   app.enableShutdownHooks();
  // }

  await app.listen(port);

  console.info(`🚀 Server running on: http://localhost:${port}`);
  console.info(`📋 API Base URL: http://localhost:${port}/svc/api/docs`);
  console.info(`👤 Users API: http://localhost:${port}/svc/users`);

  return app;
}

void bootstrap();
