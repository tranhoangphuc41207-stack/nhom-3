import {
  Body, Controller, DefaultValuePipe, Get, Param, ParseIntPipe, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';
import { CreateMetricDto } from './dto/create-metric.dto';
import { ApiKeyGuard } from './api-key.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly service: MetricsService) {}

  // Agent gửi dữ liệu: xác thực bằng API key (không dùng token đăng nhập)
  @ApiHeader({ name: 'x-api-key', required: true, description: 'API key cấp cho agent' })
  @UseGuards(ApiKeyGuard)
  @Post()
  ingest(@Body() dto: CreateMetricDto) {
    return this.service.ingest(dto);
  }

  // Dashboard xem lịch sử: dùng token đăng nhập, mọi role đều xem được
  @UseGuards(JwtAuthGuard)
  @Get(':serverId')
  history(
    @Param('serverId', ParseIntPipe) serverId: number,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.service.findHistory(serverId, limit);
  }
}
