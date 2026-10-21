import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditLogsService } from './audit-logs.service';

const VERBS: Record<string, string> = {
  POST: 'CREATE',
  PUT: 'UPDATE',
  PATCH: 'UPDATE',
  DELETE: 'DELETE',
};

// tên đối tượng ghi vào cột entity_type
const ENTITY_NAMES: Record<string, string> = {
  servers: 'SERVER',
  users: 'USER',
  alerts: 'ALERT',
  tickets: 'TICKET',
  'maintenance-logs': 'MAINTENANCE_LOG',
};

const SENSITIVE = ['password', 'passwordHash', 'password_hash'];

function sanitize(body: any) {
  if (!body || typeof body !== 'object') return body;
  const copy = { ...body };
  for (const k of SENSITIVE) delete copy[k];
  return copy;
}

/**
 * Tự ghi audit log cho mọi request thêm/sửa/xóa (POST, PUT, PATCH, DELETE)
 * đã thành công. Đăng nhập được ghi riêng trong AuthService.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditLogsService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const verb = VERBS[req.method];
    if (!verb || req.path.startsWith('/auth') || req.path.startsWith('/metrics')) return next.handle();

    return next.handle().pipe(
      tap((result) => {
        const segments: string[] = req.path.split('/').filter(Boolean);
        const resource = segments[0] ?? 'unknown';
        const entityType = ENTITY_NAMES[resource] ?? resource.toUpperCase();

        // vd: PATCH /servers/1/thresholds -> UPDATE_SERVER_THRESHOLDS
        const sub = segments.slice(1).filter((s) => !/^\d+$/.test(s));
        const action = `${verb}_${entityType}${sub.length ? '_' + sub.join('_').toUpperCase() : ''}`;

        const rawId = req.params?.id ?? result?.id;
        const entityId = rawId !== undefined && Number.isInteger(Number(rawId)) ? Number(rawId) : null;

        // không await: không làm chậm phản hồi
        void this.audit.log({
          userId: req.user?.id ?? null,
          action,
          entityType,
          entityId,
          details: { method: req.method, path: req.originalUrl, body: sanitize(req.body) },
        });
      }),
    );
  }
}
