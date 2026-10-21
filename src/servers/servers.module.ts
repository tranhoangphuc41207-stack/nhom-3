import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './server.entity';
import { ServersService } from './servers.service';
import { ServersController } from './servers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Server])],
  providers: [ServersService],
  controllers: [ServersController],
  exports: [ServersService, TypeOrmModule],
})
export class ServersModule {}
