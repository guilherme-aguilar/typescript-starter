// backend/src/vpn/vpn.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import { VpnDto } from './dto/vpn.dto';

const execAsync = promisify(exec);

@Injectable()
export class VpnService {
  private readonly logger = new Logger(VpnService.name);
  private vpnConnections: Map<string, VpnDto> = new Map();

  async createVpnConnection(vpnDto: VpnDto): Promise<VpnDto> {
    const { id, name, server, username, password } = vpnDto;
    this.logger.log(`Creating VPN connection to ${server}`);

    try {
      // Gerar arquivo de configuração para PPTP
      const configContent = this.generatePptpConfig(vpnDto);
      await fs.promises.writeFile(`/etc/ppp/peers/${id}`, configContent);

      // Configurar credenciais
      await fs.promises.appendFile('/etc/ppp/chap-secrets', 
        `${username} PPTP ${password} *\n`);

      this.vpnConnections.set(id, vpnDto);
      return vpnDto;
    } catch (error) {
      this.logger.error(`Failed to create VPN connection: ${error.message}`);
      throw error;
    }
  }

  async connectVpn(id: string): Promise<boolean> {
    const vpn = this.vpnConnections.get(id);
    if (!vpn) {
      throw new Error(`VPN connection with ID ${id} not found`);
    }

    try {
      // Iniciar conexão PPTP
      await execAsync(`pppd call ${id}`);
      this.logger.log(`Connected to VPN ${vpn.name}`);

      // Configurar routing e iptables
      await execAsync(`setup-routing.sh ppp0`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to connect to VPN: ${error.message}`);
      throw error;
    }
  }

  async disconnectVpn(id: string): Promise<boolean> {
    const vpn = this.vpnConnections.get(id);
    if (!vpn) {
      throw new Error(`VPN connection with ID ${id} not found`);
    }

    try {
      // Encerrar conexão PPTP
      await execAsync(`pkill -f "pppd call ${id}"`);
      this.logger.log(`Disconnected from VPN ${vpn.name}`);

      // Restaurar routing e iptables
      await execAsync(`cleanup-routing.sh`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to disconnect VPN: ${error.message}`);
      throw error;
    }
  }

  getVpnConnections(): VpnDto[] {
    return Array.from(this.vpnConnections.values());
  }

  getVpnStatus(id: string): Promise<{ connected: boolean; interface?: string; ip?: string }> {
    return new Promise(async (resolve) => {
      try {
        const { stdout } = await execAsync(`ifconfig ppp0`);
        if (stdout.includes('inet ')) {
          const ipMatch = stdout.match(/inet (\d+\.\d+\.\d+\.\d+)/);
          const ip = ipMatch ? ipMatch[1] : undefined;
          resolve({ connected: true, interface: 'ppp0', ip });
        } else {
          resolve({ connected: false });
        }
      } catch (error) {
        resolve({ connected: false });
      }
    });
  }

  private generatePptpConfig(vpn: VpnDto): string {
    return `
pty "pptp ${vpn.server} --nolaunchpppd"
name ${vpn.username}
password ${vpn.password}
remotename PPTP
require-mppe-128
require-mschap-v2
refuse-eap
refuse-pap
refuse-chap
refuse-mschap
noauth
debug
persist
maxfail 0
defaultroute
replacedefaultroute
usepeerdns
`;
  }
}