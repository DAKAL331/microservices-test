import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL')!;
  }

  get rabbitmqUrl(): string {
    return this.configService.get<string>('RABBITMQ_URL')!;
  }

  get rabbitmqQueue(): string {
    return this.configService.get<string>('RABBITMQ_QUEUE')!;
  }
}
