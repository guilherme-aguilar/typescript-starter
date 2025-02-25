// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { VpnModule } from './vpn/vpn.module';
import { ProxyModule } from './proxy/proxy.module';

@Module({
  imports: [VpnModule, ProxyModule],
})
export class AppModule {}