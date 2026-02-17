import {
  IsString,
  IsNumber,
  IsISO8601,
  IsOptional,
  IsObject,
} from 'class-validator';

export class AlertPayloadDto {
  @IsString()
  city: string;

  @IsString()
  regionCode: string;

  @IsNumber()
  aqi: number;

  @IsString()
  category: string;

  @IsString()
  dominantPollutant: string;

  @IsNumber()
  @IsOptional()
  pm25: number | null;

  @IsNumber()
  @IsOptional()
  pm10: number | null;

  @IsObject()
  color: Record<string, number>;

  @IsISO8601()
  timestamp: string;
}
