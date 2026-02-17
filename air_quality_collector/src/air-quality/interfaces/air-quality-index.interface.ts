export interface AirQualityIndex {
  aqi: number;
  category: string;
  dominantPollutant: string;
  color: Record<string, number>;
}
