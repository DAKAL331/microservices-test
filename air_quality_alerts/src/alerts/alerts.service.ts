import { Injectable, Logger } from '@nestjs/common';
import { AlertPayloadDto } from './dto/alert.dto';
import { colorToHex } from '../common/utils/color.util';
import { PrismaService } from '../prisma/prisma.service';
import { WsGateway } from '../ws/ws.gateway';
import { WsEvents } from '../ws/events/events-names';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly wsGateway: WsGateway,
  ) {}

  async processAlert(payload: AlertPayloadDto) {
    const hex = colorToHex(payload.color);

    this.logger.warn(
      `[ALERT] CRITICAL AIR QUALITY DETECTED\n` +
        `City: ${payload.city} | Region: ${payload.regionCode}\n` +
        `AQI: ${payload.aqi} | Category: ${payload.category}\n` +
        `PM2.5: ${payload.pm25 ?? 'N/A'} µg/m³ | PM10: ${payload.pm10 ?? 'N/A'} µg/m³\n` +
        `Dominant: ${payload.dominantPollutant} | Color: ${hex}`,
    );

    const alert = await this.prisma.alert.create({
      data: {
        city: payload.city,
        regionCode: payload.regionCode,
        aqi: payload.aqi,
        category: payload.category,
        dominantPollutant: payload.dominantPollutant,
        pm25: payload.pm25 ?? null,
        pm10: payload.pm10 ?? null,
        color: JSON.stringify(payload.color),
        timestamp: new Date(payload.timestamp),
      },
    });

    this.logger.log(`Alert persisted with id ${alert.id}`);

    this.wsGateway.emit(WsEvents.NEW_ALERT, alert);

    return alert;
  }

  async getLatestAlerts() {
    return this.prisma.alert.findMany({
      select: {
        city: true,
        aqi: true,
        category: true,
        timestamp: true,
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
    });
  }
}
