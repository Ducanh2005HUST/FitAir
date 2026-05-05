import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class SearchSpotsDto {
  @IsOptional()
  @IsNumberString()
  lat?: string;

  @IsOptional()
  @IsNumberString()
  lng?: string;

  @IsOptional()
  @IsNumberString()
  radiusKm?: string;

  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsIn(['indoor', 'outdoor'])
  type?: 'indoor' | 'outdoor';

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsIn(['distance', 'rating'])
  sort?: 'distance' | 'rating';
}

