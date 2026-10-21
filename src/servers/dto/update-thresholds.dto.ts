import { IsNumber, Max, Min } from 'class-validator';

export class UpdateThresholdsDto {
  @IsNumber() @Min(0) @Max(100) cpuThreshold: number;
  @IsNumber() @Min(0) @Max(100) ramThreshold: number;
}
