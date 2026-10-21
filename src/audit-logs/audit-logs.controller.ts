import {
  BadRequestException, Controller, DefaultValuePipe, Get, ParseIntPipe, Query, UseGuards,
} from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { Role } from '../common/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  // GET /audit-logs?userId=4&entityType=server&action=DELETE_SERVER&page=1&limit=50
  @Get()
  findAll(
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    let uid: number | undefined;
    if (userId !== undefined && userId !== '') {
      uid = parseInt(userId, 10);
      if (Number.isNaN(uid)) throw new BadRequestException('userId phải là số');
    }
    return this.service.findAll({ userId: uid, entityType, action, page, limit });
  }
}
