import {
  Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ServersService } from './servers.service';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { UpdateThresholdsDto } from './dto/update-thresholds.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/role.enum';

// Mọi route cần đăng nhập; route nào có @Roles thì kiểm tra thêm role
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  findAll() {
    return this.serversService.findAll();
  }

  // Phải đặt TRƯỚC @Get(':id'), nếu không 'warranty' sẽ bị hiểu là id
  @Get('warranty/expiring')
  findExpiringWarranty(@Query('days', new DefaultValuePipe(30), ParseIntPipe) days: number) {
    return this.serversService.findExpiringWarranty(days);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateServerDto) {
    return this.serversService.create(dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServerDto) {
    return this.serversService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/thresholds')
  updateThresholds(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateThresholdsDto) {
    return this.serversService.updateThresholds(id, dto);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStatusDto) {
    return this.serversService.updateStatus(id, dto.status);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.remove(id);
  }
}
