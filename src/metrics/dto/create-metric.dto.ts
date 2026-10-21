import { Type } from 'class-transformer';
import {
  IsArray, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateNested,
} from 'class-validator';

export class DockerContainerDto {
  @IsString() name: string;
  @IsString() status: string; // running | exited | paused ...
  @IsOptional() @IsNumber() cpuPercent?: number;
  @IsOptional() @IsNumber() memMb?: number;
}

export class CreateMetricDto {
  @IsString() serverCode: string;
  @IsNumber() @Min(0) @Max(100) cpuUsage: number;
  @IsNumber() @Min(0) @Max(100) ramUsage: number;
  @IsOptional() @IsInt() @Min(0) networkIn?: number;
  @IsOptional() @IsInt() @Min(0) networkOut?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DockerContainerDto)
  docker?: DockerContainerDto[];

  @IsOptional() @IsDateString() recordedAt?: string;
}
