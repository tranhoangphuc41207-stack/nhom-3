import {
  BadRequestException, Controller, DefaultValuePipe, Get, Param, ParseIntPipe,
  Patch, Query, Req, UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly service: AlertsService) {}

  // GET /alerts?status=OPEN&severity=CRITICAL&serverId=1&page=1&limit=50
  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('serverId') serverId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    let sid: number | undefined;
    if (serverId !== undefined && serverId !== '') {
      sid = parseInt(serverId, 10);
      if (Number.isNaN(sid)) throw new BadRequestException('serverId phải là số');
    }
    return this.service.findAll({ status, severity, serverId: sid, page, limit });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Patch(':id/acknowledge')
  acknowledge(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.acknowledge(id, req.user.id);
  }

  @Roles(Role.ADMIN, Role.OPERATOR)
  @Patch(':id/resolve')
  resolve(@Param('id', ParseIntPipe) id: number) {
    return this.service.resolve(id);
  }
}
