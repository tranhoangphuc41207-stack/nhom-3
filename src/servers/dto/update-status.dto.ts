import { IsEnum } from 'class-validator';
import { ServerStatus } from '../server-status.enum';

export class UpdateStatusDto {
  @IsEnum(ServerStatus) status: ServerStatus;
}
