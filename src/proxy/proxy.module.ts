// backend/src/proxy/proxy.module.ts
import { Module } from '@nestjs/common';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { VpnModule } from '../vpn/vpn.module';

@Module({
  imports: [VpnModule],
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}