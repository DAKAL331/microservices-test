import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigService, validate } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AlertsController } from './alerts/alerts.controller';
import { AlertsService } from './alerts/alerts.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, validate }), PrismaModule],
  controllers: [AppController, AlertsController],
  providers: [AppService, AppConfigService, AlertsService],
  exports: [AppConfigService],
})
export class AppModule {}
