import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { AirQualityService } from '../air-quality';

@Injectable()
export class SchedulerService {
  constructor(private readonly airQualityService: AirQualityService) {}

  @Interval(10_000)
  async handleAirQualityPolling(): Promise<void> {
    await this.airQualityService.pollAirQuality();
  }
}
