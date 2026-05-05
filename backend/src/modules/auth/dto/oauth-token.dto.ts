import { IsString, MinLength } from 'class-validator';

export class OAuthTokenDto {
  @IsString()
  @MinLength(5)
  token!: string;
}

