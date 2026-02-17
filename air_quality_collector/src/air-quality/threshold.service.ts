import { Injectable } from '@nestjs/common';
import { THRESHOLDS } from './constants/air-quality.constants';
import { AirQualityResult, PollutantConcentration } from './interfaces';

@Injectable()
export class ThresholdService {
  isCritical(result: AirQualityResult): boolean {
    if (result.aqi > THRESHOLDS.UAQI) {
      return true;
    }

    const pm25 = this.getPollutantValue(result.pollutants, 'pm25');
    if (pm25 !== null && pm25 > THRESHOLDS.PM25) {
      return true;
    }

    const pm10 = this.getPollutantValue(result.pollutants, 'pm10');
    if (pm10 !== null && pm10 > THRESHOLDS.PM10) {
      return true;
    }

    return false;
  }

  getPollutantValue(
    pollutants: PollutantConcentration[],
    code: string,
  ): number | null {
    return (
      pollutants.find((p) => p.code === code)?.concentration?.value ?? null
    );
  }
}
