import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from '../config';
import { AIR_QUALITY_API_URL, CITIES } from './constants/air-quality.constants';
import { AirQualityResponse, AirQualityResult, City } from './interfaces';

@Injectable()
export class AirQualityApiClient {
  private readonly logger = new Logger(AirQualityApiClient.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly appConfig: AppConfigService,
  ) {}

  async fetchAllCities(): Promise<AirQualityResult[]> {
    const results = await Promise.all(
      CITIES.map((city) => this.fetchCity(city)),
    );

    return results.filter((r): r is AirQualityResult => r !== null);
  }

  async fetchCity(city: City): Promise<AirQualityResult | null> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<AirQualityResponse>(
          AIR_QUALITY_API_URL,
          {
            location: { latitude: city.latitude, longitude: city.longitude },
            extraComputations: [
              'DOMINANT_POLLUTANT_CONCENTRATION',
              'POLLUTANT_CONCENTRATION',
            ],
          },
          {
            params: { key: this.appConfig.googleAirQualityApiKey },
          },
        ),
      );

      const result = this.mapResponse(city.name, data);
      this.logger.log(
        `[${city.name}] AQI: ${result.aqi}, Category: ${result.category}, Dominant: ${result.dominantPollutant}`,
      );

      return result;
    } catch (error) {
      this.logger.error(`[${city.name}] API request failed: ${error.message}`);
      return null;
    }
  }

  private mapResponse(
    city: string,
    response: AirQualityResponse,
  ): AirQualityResult {
    const primaryIndex = response.indexes?.[0];

    return {
      city,
      aqi: primaryIndex?.aqi,
      category: primaryIndex?.category,
      dominantPollutant: primaryIndex?.dominantPollutant,
      regionCode: response.regionCode,
      color: primaryIndex?.color,
      pollutants: response.pollutants,
      isCritical: false,
    };
  }
}
