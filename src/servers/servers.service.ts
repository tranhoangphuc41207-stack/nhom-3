import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Server } from './server.entity';
import { CreateServerDto } from './dto/create-server.dto';
import { UpdateServerDto } from './dto/update-server.dto';
import { UpdateThresholdsDto } from './dto/update-thresholds.dto';
import { ServerStatus } from './server-status.enum';

@Injectable()
export class ServersService {
  constructor(@InjectRepository(Server) private repo: Repository<Server>) { }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number) {
    const server = await this.repo.findOne({ where: { id } });
    if (!server) throw new NotFoundException('Không tìm thấy máy chủ');
    return server;
  }

  // Máy chủ đã hết hoặc sắp hết bảo hành trong `days` ngày tới
  findExpiringWarranty(days: number) {
    return this.repo
      .createQueryBuilder('s')
      .where('s.warranty_expiry IS NOT NULL')
      .andWhere('s.warranty_expiry <= CURRENT_DATE + CAST(:days AS INTEGER)', { days })
      .orderBy('s.warranty_expiry', 'ASC')
      .getMany();
  }

  async create(dto: CreateServerDto) {
    try {
      return await this.repo.save(this.repo.create(dto));
    } catch (e) {
      this.handleUnique(e);
    }
  }

  async update(id: number, dto: UpdateServerDto) {
    const server = await this.findOne(id);
    // bỏ các trường undefined để không đè lên dữ liệu cũ
    const changes = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    Object.assign(server, changes);
    try {
      return await this.repo.save(server);
    } catch (e) {
      this.handleUnique(e);
    }
  }

  async updateThresholds(id: number, dto: UpdateThresholdsDto) {
    const server = await this.findOne(id);
    server.cpuThreshold = dto.cpuThreshold;
    server.ramThreshold = dto.ramThreshold;
    return this.repo.save(server);
  }

  async updateStatus(id: number, status: ServerStatus) {
    const server = await this.findOne(id);
    server.status = status;
    return this.repo.save(server);
  }

  async remove(id: number) {
    const server = await this.findOne(id);
    try {
      await this.repo.remove(server);
      return { deleted: true, id };
    } catch (e) {
      // 23503 = foreign key violation (server đã có history/alerts/tickets)
      if (e instanceof QueryFailedError && (e as any).driverError?.code === '23503') {
        throw new ConflictException(
          'Không thể xóa: máy chủ đã có dữ liệu liên quan (lịch sử, cảnh báo, phiếu bảo trì)',
        );
      }
      throw e;
    }
  }

  private handleUnique(e: unknown): never {
    // 23505 = unique violation (server_code hoặc qr_code trùng)
    if (e instanceof QueryFailedError && (e as any).driverError?.code === '23505') {
      throw new ConflictException('Mã máy chủ, mã QR hoặc số serial đã tồn tại');
    }
    throw e;
  }
}
