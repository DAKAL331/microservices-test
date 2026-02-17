import { Controller, Get, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AlertPayloadDto } from '../dto/alert-payload.dto';
import { AlertsService } from './alerts.service';

@Controller()
export class AlertsController {
  private readonly logger = new Logger(AlertsController.name);

  constructor(private readonly alertsService: AlertsService) {}

  @Get('alerts')
  async getAlerts() {
    return this.alertsService.getLatestAlerts();
  }

  @EventPattern('air_quality_alert')
  async handleAlert(
    @Payload() rawPayload: any,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    const payload = plainToInstance(AlertPayloadDto, rawPayload);
    const errors = await validate(payload, {
      whitelist: true,
    });

    if (errors.length > 0) {
      this.logger.error(
        `Payload validation failed: ${JSON.stringify(errors.map((e) => e.constraints))}`,
      );
      channel.nack(originalMsg, false, false);
      return;
    }

    try {
      const alert = await this.alertsService.processAlert(payload);
      channel.ack(originalMsg);
      this.logger.log(
        `Alert processed and ACK'd for ${payload.city}`,
      );
      return alert;
    } catch (error) {
      this.logger.error(
        `Failed to process alert: ${error.message}`,
        error.stack,
      );
      channel.nack(originalMsg, false, false);
    }
  }
}
