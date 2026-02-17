import { Injectable } from '@nestjs/common';
import {
  HealthCheckService,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RabbitmqHealthIndicator } from './rabbitmq-health.indicator';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly rabbitmq: RabbitmqHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  check() {
    return this.health.check([
      () => this.rabbitmq.isHealthy('rabbitmq'),
      () => this.disk.checkStorage('disk', { path: '/', thresholdPercent: 0.9 }),
      () => this.memory.checkHeap('memory', 300 * 1024 * 1024),
    ]);
  }
}
