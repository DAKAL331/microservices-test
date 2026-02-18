import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigService, validate } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { WsModule } from './ws/ws.module';
import { AlertsModule } from './alerts/alerts.module';
import { ConsumerModule } from './consumer/consumer.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate }), PrismaModule, HealthModule, WsModule, AlertsModule, ConsumerModule],
  controllers: [AppController],
  providers: [AppService, AppConfigService],
  exports: [AppConfigService],
})
export class AppModule {}
