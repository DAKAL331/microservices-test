import {
  IsString,
  IsNumber,
  IsISO8601,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AlertPayloadDto {
  @ApiProperty({ example: 'Dubai', description: 'City name' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'AE', description: 'ISO region code' })
  @IsString()
  regionCode: string;

  @ApiProperty({ example: 180, description: 'Air Quality Index value' })
  @IsNumber()
  aqi: number;

  @ApiProperty({ example: 'Unhealthy', description: 'AQI category label' })
  @IsString()
  category: string;

  @ApiProperty({ example: 'pm25', description: 'Dominant pollutant code' })
  @IsString()
  dominantPollutant: string;

  @ApiPropertyOptional({ example: 172.4, description: 'PM2.5 concentration in µg/m³' })
  @IsNumber()
  @IsOptional()
  pm25: number | null;

  @ApiPropertyOptional({ example: 205.8, description: 'PM10 concentration in µg/m³' })
  @IsNumber()
  @IsOptional()
  pm10: number | null;

  @ApiProperty({ example: { red: 255, green: 0, blue: 0 }, description: 'RGB color object' })
  @IsObject()
  color: Record<string, number>;

  @ApiProperty({ example: '2026-02-17T12:00:00.000Z', description: 'ISO 8601 timestamp' })
  @IsISO8601()
  timestamp: string;
}
