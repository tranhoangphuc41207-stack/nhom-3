import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ServerStatus } from './server-status.enum';

// numeric trong Postgres được trả về dạng string, nên chuyển sang number
const numeric = {
  to: (v?: number) => v,
  from: (v?: string | null) => (v === null || v === undefined ? v : parseFloat(v)),
};

@Entity('servers')
export class Server {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'server_code', unique: true })
  serverCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', nullable: true })
  location: string | null;

  @Column({ name: 'qr_code', type: 'varchar', unique: true, nullable: true })
  qrCode: string | null;

  @Column({ type: 'varchar', default: ServerStatus.UNKNOWN })
  status: ServerStatus;

  @Column({ name: 'cpu_threshold', type: 'numeric', precision: 5, scale: 2, default: 80, transformer: numeric })
  cpuThreshold: number;

  @Column({ name: 'ram_threshold', type: 'numeric', precision: 5, scale: 2, default: 80, transformer: numeric })
  ramThreshold: number;

  // ---- Thông tin phần cứng & bảo hành ----
  @Column({ type: 'varchar', nullable: true })
  manufacturer: string | null;

  @Column({ type: 'varchar', nullable: true })
  model: string | null;

  @Column({ name: 'serial_number', type: 'varchar', unique: true, nullable: true })
  serialNumber: string | null;

  @Column({ name: 'cpu_model', type: 'varchar', nullable: true })
  cpuModel: string | null;

  @Column({ name: 'ram_gb', type: 'int', nullable: true })
  ramGb: number | null;

  @Column({ name: 'storage_gb', type: 'int', nullable: true })
  storageGb: number | null;

  // kiểu date trả về chuỗi 'YYYY-MM-DD'
  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: string | null;

  @Column({ name: 'warranty_expiry', type: 'date', nullable: true })
  warrantyExpiry: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
