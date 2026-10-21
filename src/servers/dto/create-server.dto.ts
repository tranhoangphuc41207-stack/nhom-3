import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ServerStatus } from '../server-status.enum';

export class CreateServerDto {
  @IsString() @MaxLength(50) serverCode: string;
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @IsString() @MaxLength(255) qrCode?: string;
  @IsOptional() @IsEnum(ServerStatus) status?: ServerStatus;
  @IsOptional() @IsNumber() @Min(0) @Max(100) cpuThreshold?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) ramThreshold?: number;
  @IsOptional() @IsString() @MaxLength(100) manufacturer?: string;
  @IsOptional() @IsString() @MaxLength(100) model?: string;
  @IsOptional() @IsString() @MaxLength(100) serialNumber?: string;
  @IsOptional() @IsString() @MaxLength(100) cpuModel?: string;
  @IsOptional() @IsInt() @Min(1) ramGb?: number;
  @IsOptional() @IsInt() @Min(1) storageGb?: number;
  @IsOptional() @IsDateString() purchaseDate?: string;
  @IsOptional() @IsDateString() warrantyExpiry?: string;
}
