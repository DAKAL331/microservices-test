import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RABBITMQ_CLIENT } from '../messaging';
import { AIR_QUALITY_ALERT_EVENT } from '../air-quality/constants/air-quality.constants';
import { AirQualityAlertDto } from '../air-quality/dto';
import { colorToHex } from '../common/utils/color.util';

@Injectable()
export class PublisherService implements OnModuleInit {
  private readonly logger = new Logger(PublisherService.name);

  constructor(
    @Inject(RABBITMQ_CLIENT) private readonly rmqClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.rmqClient.connect();
      this.logger.log('RabbitMQ client connected successfully');
    } catch (error) {
      this.logger.error(
        `Failed to connect to RabbitMQ: ${error.message}`,
        error.stack,
      );
    }
  }

  async publishAlert(payload: AirQualityAlertDto): Promise<void> {
    const hex = colorToHex(payload.color);

    this.logger.warn(
      `[ALERT] CRITICAL AIR QUALITY DETECTED\n` +
        `City: ${payload.city} | Region: ${payload.regionCode}\n` +
        `AQI: ${payload.aqi} | Category: ${payload.category}\n` +
        `PM2.5: ${payload.pm25 ?? 'N/A'} µg/m³ | PM10: ${payload.pm10 ?? 'N/A'} µg/m³\n` +
        `Dominant: ${payload.dominantPollutant} | Color: ${hex}`,
    );

    try {
      await lastValueFrom(
        this.rmqClient.emit(AIR_QUALITY_ALERT_EVENT, payload),
      );
      this.logger.log(`[${payload.city}] Alert published to RabbitMQ`);
    } catch (error) {
      this.logger.error(
        `[${payload.city}] Failed to publish alert: ${error.message}`,
        error.stack,
      );
    }
  }
}
