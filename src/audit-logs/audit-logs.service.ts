import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

export interface LogParams {
  userId?: number | null;
  action: string;
  entityType?: string | null;
  entityId?: number | null;
  details?: unknown;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(@InjectRepository(AuditLog) private repo: Repository<AuditLog>) {}

  // Ghi log. Nếu ghi lỗi thì chỉ báo trong console, KHÔNG làm hỏng request chính.
  async log(p: LogParams): Promise<void> {
    try {
      await this.repo.insert({
        userId: p.userId ?? null,
        action: p.action,
        entityType: p.entityType ?? null,
        entityId: p.entityId ?? null,
        details:
          p.details === undefined || p.details === null
            ? null
            : typeof p.details === 'string'
              ? p.details
              : JSON.stringify(p.details),
      });
    } catch (e) {
      this.logger.error(`Không ghi được audit log (${p.action}): ${(e as Error).message}`);
    }
  }

  async findAll(opts: {
    userId?: number;
    entityType?: string;
    action?: string;
    page: number;
    limit: number;
  }) {
    const limit = Math.min(Math.max(opts.limit, 1), 200);
    const page = Math.max(opts.page, 1);

    const where: FindOptionsWhere<AuditLog> = {};
    if (opts.userId !== undefined) where.userId = opts.userId;
    if (opts.entityType) where.entityType = opts.entityType.toUpperCase();
    if (opts.action) where.action = opts.action.toUpperCase();

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit };
  }
}
