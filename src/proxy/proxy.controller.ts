// backend/src/proxy/proxy.controller.ts
import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ProxyService } from './proxy.service';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('start')
  async startProxy(@Body() body: { port?: number }) {
    try {
      const port = body.port || 8080;
      this.proxyService.startProxyServer(port);
      return { success: true, message: `Proxy server started on port ${port}` };
    } catch (error) {
      throw new HttpException(
        `Failed to start proxy server: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('stop')
  async stopProxy() {
    try {
      await this.proxyService.stopProxyServer();
      return { success: true, message: 'Proxy server stopped' };
    } catch (error) {
      throw new HttpException(
        `Failed to stop proxy server: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('info')
  getProxyInfo() {
    return {
      usage: 'To use the proxy, make HTTP requests to /api/proxy?url=YOUR_TARGET_URL',
      example: 'GET /api/proxy?url=https://example.com',
    };
  }
}