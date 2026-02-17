import { PollutantConcentration } from './pollutant-concentration.interface';

export interface AirQualityResult {
  city: string;
  aqi: number;
  category: string;
  dominantPollutant: string;
  regionCode: string;
  color: Record<string, number>;
  pollutants: PollutantConcentration[];
  isCritical: boolean;
}
