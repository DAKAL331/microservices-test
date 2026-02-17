import { City } from '../interfaces';

export const AIR_QUALITY_API_URL =
  'https://airquality.googleapis.com/v1/currentConditions:lookup';

export const CITIES: City[] = [
  { name: 'Riyadh', latitude: 24.7136, longitude: 46.6753 },
  { name: 'Dubai', latitude: 25.2048, longitude: 55.2708 },
  { name: 'Doha', latitude: 25.2854, longitude: 51.531 },
  { name: 'Muscat', latitude: 23.588, longitude: 58.3829 },
];

export const THRESHOLDS = {
  PM25: 100,
  PM10: 150,
  UAQI: 100,
} as const;

export const AIR_QUALITY_ALERT_EVENT = 'air_quality_alert';
