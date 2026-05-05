import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  content!: string;

  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsInt()
  maxParticipants?: number;
}

