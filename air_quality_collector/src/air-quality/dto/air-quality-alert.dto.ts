import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class AirQualityAlertDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  regionCode: string;

  @IsString()
  @IsNotEmpty()
  timestamp: string;

  @IsNumber()
  aqi: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  dominantPollutant: string;

  @IsNumber()
  @IsOptional()
  pm25: number | null;

  @IsNumber()
  @IsOptional()
  pm10: number | null;

  @IsNotEmpty()
  color: Record<string, number>;
}
