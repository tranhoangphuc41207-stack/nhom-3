import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'server_id', type: 'int' })
  serverId: number;

  @Column({ name: 'alert_type', type: 'varchar' })
  alertType: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'varchar', default: 'WARNING' })
  severity: string;

  @Column({ type: 'varchar', default: 'OPEN' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'acknowledged_by', type: 'int', nullable: true })
  acknowledgedBy: number | null;

  @Column({ name: 'acknowledged_at', type: 'timestamp', nullable: true })
  acknowledgedAt: Date | null;
}
