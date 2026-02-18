import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AlertsService } from '../alerts/alerts.service';

@Controller()
export class ConsumerController {
  private readonly logger = new Logger(ConsumerController.name);

  constructor(private readonly alertsService: AlertsService) {}

  @EventPattern('air_quality_alert')
  async handleAlert(@Payload() rawPayload: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.alertsService.handleAlert(rawPayload);
      channel.ack(originalMsg);
    } catch (error) {
      this.logger.error(`Failed to handle alert: ${error.message}`, error.stack);
      channel.nack(originalMsg, false, false);
    }
  }
}
