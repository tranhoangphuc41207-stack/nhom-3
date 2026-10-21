import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// numeric / bigint của Postgres được trả về dạng string -> đổi sang number
const toNumber = {
  to: (v?: number | null) => v,
  from: (v?: string | null) => (v === null || v === undefined ? null : Number(v)),
};

@Entity('history')
export class History {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'server_id', type: 'int' })
  serverId: number;

  @Column({ name: 'cpu_usage', type: 'numeric', precision: 5, scale: 2, nullable: true, transformer: toNumber })
  cpuUsage: number | null;

  @Column({ name: 'ram_usage', type: 'numeric', precision: 5, scale: 2, nullable: true, transformer: toNumber })
  ramUsage: number | null;

  @Column({ name: 'network_in', type: 'bigint', nullable: true, transformer: toNumber })
  networkIn: number | null;

  @Column({ name: 'network_out', type: 'bigint', nullable: true, transformer: toNumber })
  networkOut: number | null;

  @Column({ name: 'recorded_at', type: 'timestamp' })
  recordedAt: Date;

  @Column({ name: 'docker_info', type: 'jsonb', nullable: true })
  dockerInfo: unknown[] | null;
}
