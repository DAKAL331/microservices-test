import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get googleAirQualityApiKey(): string {
    return this.configService.get<string>('GOOGLE_AIR_QUALITY_API_KEY')!;
  }

  get rabbitmqUrl(): string {
    return this.configService.get<string>('RABBITMQ_URL')!;
  }

  get rabbitmqQueue(): string {
    return this.configService.get<string>('RABBITMQ_QUEUE')!;
  }

  get pollIntervalMs(): number {
    return this.configService.get<number>('POLL_INTERVAL_MS')!;
  }
}
