import { type INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication, port: number): void {
  const documentBuilder = new DocumentBuilder()
    .setTitle('Backend Service API')
    .setDescription('The Backend Service API documentation')
    .setVersion('1.0')
    .addBearerAuth();

  const document = SwaggerModule.createDocument(app, documentBuilder.build());
  SwaggerModule.setup('svc/api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  console.info(
    `📚 API Documentation: http://localhost:${port}/svc/api/docs`,
  );
}
