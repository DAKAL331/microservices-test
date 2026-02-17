import { AirQualityIndex } from './air-quality-index.interface';
import { PollutantConcentration } from './pollutant-concentration.interface';

export interface AirQualityResponse {
  regionCode: string;
  indexes: AirQualityIndex[];
  pollutants: PollutantConcentration[];
}
