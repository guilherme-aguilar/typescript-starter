// backend/src/vpn/dto/vpn.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class VpnDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  server: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  description?: string;
}