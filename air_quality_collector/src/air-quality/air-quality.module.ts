import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PublisherModule } from '../publisher';
import { AppConfigService } from '../config';
import { AirQualityService } from './air-quality.service';
import { AirQualityApiClient } from './air-quality-api.client';
import { ThresholdService } from './threshold.service';

@Module({
  imports: [HttpModule, PublisherModule],
  providers: [
    AirQualityService,
    AirQualityApiClient,
    ThresholdService,
    AppConfigService,
  ],
  exports: [AirQualityService],
})
export class AirQualityModule {}
