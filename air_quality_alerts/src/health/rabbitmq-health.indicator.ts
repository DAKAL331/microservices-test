import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import * as amqplib from 'amqplib';

@Injectable()
export class RabbitmqHealthIndicator extends HealthIndicator {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const url = this.configService.get<string>('RABBITMQ_URL');
      const connection = await amqplib.connect(url);
      await connection.close();
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        `${key} is not available`,
        this.getStatus(key, false, { message: error.message }),
      );
    }
  }
}
