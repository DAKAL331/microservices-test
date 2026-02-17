import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { HttpExceptionFilter } from './interceptors/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const configService = app.get(ConfigService);

  const rabbitmqUrl = configService.getOrThrow<string>('RABBITMQ_URL');
  const rabbitmqQueue = configService.getOrThrow<string>('RABBITMQ_QUEUE');

  logger.log(`Connecting to RabbitMQ at ${rabbitmqUrl}, queue: "${rabbitmqQueue}"`);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: rabbitmqQueue,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  logger.log(`RabbitMQ microservice connected — listening on queue "${rabbitmqQueue}"`);

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  logger.log(`HTTP server listening on port ${port}`);
}
bootstrap();
