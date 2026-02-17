import { Module } from '@nestjs/common';
import { AirQualityModule } from '../air-quality';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [AirQualityModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
