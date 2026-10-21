import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { History } from './history.entity';
import { Server } from '../servers/server.entity';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [TypeOrmModule.forFeature([History, Server]), AlertsModule],
  providers: [MetricsService],
  controllers: [MetricsController],
})
export class MetricsModule {}
