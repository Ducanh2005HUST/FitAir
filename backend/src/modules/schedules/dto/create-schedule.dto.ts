import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  type!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @MinLength(1)
  time!: string;

  @IsOptional()
  @IsString()
  note?: string;
}

