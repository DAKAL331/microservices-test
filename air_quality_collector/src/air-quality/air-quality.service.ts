import { Injectable, Logger } from '@nestjs/common';
import { CITIES } from './constants/air-quality.constants';
import { AirQualityApiClient } from './air-quality-api.client';
import { ThresholdService } from './threshold.service';
import { PublisherService } from '../publisher';
import { AirQualityAlertDto } from './dto';
import { AirQualityResult } from './interfaces';

@Injectable()
export class AirQualityService {
  private readonly logger = new Logger(AirQualityService.name);

  constructor(
    private readonly apiClient: AirQualityApiClient,
    private readonly thresholdService: ThresholdService,
    private readonly publisher: PublisherService,
  ) {}

  async pollAirQuality(): Promise<void> {
    this.logger.log(`Polling air quality for ${CITIES.length} cities...`);

    const results = await this.apiClient.fetchAllCities();
    this.logger.log(
      `Poll complete — ${results.length}/${CITIES.length} cities fetched`,
    );

    for (const result of results) {
      result.isCritical = this.thresholdService.isCritical(result);

      if (result.isCritical) {
        const payload = this.buildPayload(result);
        await this.publisher.publishAlert(payload);
      }
    }
  }

  private buildPayload(result: AirQualityResult): AirQualityAlertDto {
    const dto = new AirQualityAlertDto();
    dto.city = result.city;
    dto.regionCode = result.regionCode;
    dto.timestamp = new Date().toISOString();
    dto.aqi = result.aqi;
    dto.category = result.category;
    dto.dominantPollutant = result.dominantPollutant;
    dto.pm25 = this.thresholdService.getPollutantValue(
      result.pollutants,
      'pm25',
    );
    dto.pm10 = this.thresholdService.getPollutantValue(
      result.pollutants,
      'pm10',
    );
    dto.color = result.color;
    return dto;
  }
}
