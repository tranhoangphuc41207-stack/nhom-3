import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { Alert } from './alert.entity';
import { Server } from '../servers/server.entity';

export interface DockerContainer {
  name: string;
  status: string;
  cpuPercent?: number;
  memMb?: number;
}

// Dữ liệu một lần đo, được MetricsService truyền vào evaluate()
export interface MetricSample {
  cpuUsage: number;
  ramUsage: number;
  networkIn?: number;
  networkOut?: number;
  docker?: DockerContainer[];
  recordedAt: Date;
}

// Cảnh báo còn "sống" (chưa xử lý xong)
const ACTIVE = ['OPEN', 'ACKNOWLEDGED'];

@Injectable()
export class AlertsService {
  constructor(@InjectRepository(Alert) private repo: Repository<Alert>) {}

  /**
   * ============ CHỖ DÀNH CHO NGƯỜI LÀM ALERTING ============
   * Được gọi mỗi khi backend nhận dữ liệu từ agent.
   * - Vượt ngưỡng và chưa có cảnh báo đang mở cùng loại -> tạo cảnh báo mới.
   * - Vượt ngưỡng nhưng đã có cảnh báo cùng loại -> không tạo trùng.
   * - Trở lại bình thường -> tự đóng cảnh báo (RESOLVED).
   * Trả về danh sách loại cảnh báo đang vi phạm, vd ['HIGH_CPU'].
   * Muốn thêm luật mới (network, disk...) thì thêm một phần tử vào `checks`.
   */
  async evaluate(server: Server, m: MetricSample): Promise<string[]> {
    const downContainers = (m.docker ?? []).filter((c) => c.status !== 'running');

    const checks = [
      {
        type: 'HIGH_CPU',
        breached: m.cpuUsage > server.cpuThreshold,
        severity: m.cpuUsage >= 95 ? 'CRITICAL' : 'WARNING',
        message: `CPU usage reached ${m.cpuUsage}%, exceeding the ${server.cpuThreshold}% threshold`,
      },
      {
        type: 'HIGH_RAM',
        breached: m.ramUsage > server.ramThreshold,
        severity: m.ramUsage >= 95 ? 'CRITICAL' : 'WARNING',
        message: `RAM usage reached ${m.ramUsage}%, exceeding the ${server.ramThreshold}% threshold`,
      },
      {
        type: 'DOCKER_DOWN',
        breached: downContainers.length > 0,
        severity: 'WARNING',
        message: `Docker container not running: ${downContainers.map((c) => c.name).join(', ')}`,
      },
    ];

    const breached: string[] = [];
    for (const c of checks) {
      const active = await this.repo.findOne({
        where: { serverId: server.id, alertType: c.type, status: In(ACTIVE) },
      });

      if (c.breached) {
        breached.push(c.type);
        if (!active) {
          await this.repo.save(
            this.repo.create({
              serverId: server.id,
              alertType: c.type,
              message: c.message,
              severity: c.severity,
              status: 'OPEN',
            }),
          );
        }
      } else if (active) {
        active.status = 'RESOLVED';
        await this.repo.save(active);
      }
    }
    return breached;
  }

  async findAll(opts: {
    status?: string;
    severity?: string;
    serverId?: number;
    page: number;
    limit: number;
  }) {
    const limit = Math.min(Math.max(opts.limit, 1), 200);
    const page = Math.max(opts.page, 1);

    const where: FindOptionsWhere<Alert> = {};
    if (opts.status) where.status = opts.status.toUpperCase();
    if (opts.severity) where.severity = opts.severity.toUpperCase();
    if (opts.serverId !== undefined) where.serverId = opts.serverId;

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { id: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const alert = await this.repo.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Không tìm thấy cảnh báo');
    return alert;
  }

  async acknowledge(id: number, userId: number) {
    const alert = await this.findOne(id);
    if (alert.status !== 'OPEN') {
      throw new ConflictException('Chỉ xác nhận được cảnh báo đang ở trạng thái OPEN');
    }
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    return this.repo.save(alert);
  }

  async resolve(id: number) {
    const alert = await this.findOne(id);
    if (alert.status === 'RESOLVED') {
      throw new ConflictException('Cảnh báo đã được đóng trước đó');
    }
    alert.status = 'RESOLVED';
    return this.repo.save(alert);
  }
}
