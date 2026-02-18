import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module';
import { ConsumerController } from './consumer.controller';

@Module({
  imports: [AlertsModule],
  controllers: [ConsumerController],
})
export class ConsumerModule {}
