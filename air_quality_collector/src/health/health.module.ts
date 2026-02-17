import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { RabbitmqHealthIndicator } from './rabbitmq-health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, RabbitmqHealthIndicator],
})
export class HealthModule {}
