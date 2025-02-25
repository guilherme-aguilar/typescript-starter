// backend/src/vpn/vpn.controller.ts
import { Controller, Get, Post, Body, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { VpnService } from './vpn.service';
import { VpnDto } from './dto/vpn.dto';

@Controller('vpn')
export class VpnController {
  constructor(private readonly vpnService: VpnService) {}

  @Post()
  async create(@Body() vpnDto: VpnDto) {
    try {
      return await this.vpnService.createVpnConnection(vpnDto);
    } catch (error) {
      throw new HttpException(
        `Failed to create VPN connection: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  getAll() {
    return this.vpnService.getVpnConnections();
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    try {
      return await this.vpnService.getVpnStatus(id);
    } catch (error) {
      throw new HttpException(
        `Failed to get VPN status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/connect')
  async connect(@Param('id') id: string) {
    try {
      return await this.vpnService.connectVpn(id);
    } catch (error) {
      throw new HttpException(
        `Failed to connect to VPN: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/disconnect')
  async disconnect(@Param('id') id: string) {
    try {
      return await this.vpnService.disconnectVpn(id);
    } catch (error) {
      throw new HttpException(
        `Failed to disconnect VPN: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}