import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

/** Xác thực agent bằng header `x-api-key` so với API_KEY trong .env */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly key: Buffer;

  constructor(config: ConfigService) {
    // thiếu API_KEY trong .env thì app báo lỗi ngay lúc khởi động
    this.key = Buffer.from(config.getOrThrow<string>('API_KEY'));
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const provided = req.headers['x-api-key'];
    if (typeof provided !== 'string') {
      throw new UnauthorizedException('Thiếu hoặc sai API key');
    }
    const given = Buffer.from(provided);
    if (given.length !== this.key.length || !timingSafeEqual(given, this.key)) {
      throw new UnauthorizedException('Thiếu hoặc sai API key');
    }
    return true;
  }
}
