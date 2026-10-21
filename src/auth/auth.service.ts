import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditLogsService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      await this.audit.log({
        userId: user?.id ?? null,
        action: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user?.id ?? null,
        details: { email, reason: 'Sai email hoặc mật khẩu' },
      });
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }

    if (!user.isActive) {
      await this.audit.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'USER',
        entityId: user.id,
        details: { email, reason: 'Tài khoản bị vô hiệu hóa' },
      });
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');
    }

    await this.audit.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      details: { email },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    };
  }
}
