import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('Alerts')
@Controller()
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('alerts')
  @ApiOperation({
    summary: 'Get latest alerts',
    description:
      'Returns the 20 most recent air quality alerts ordered by timestamp descending.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of alerts returned successfully.',
  })
  async getAlerts() {
    return this.alertsService.getLatestAlerts();
  }
}
