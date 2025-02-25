// backend/src/proxy/proxy.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { VpnService } from '../vpn/vpn.service';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private server: http.Server;

  constructor(private readonly vpnService: VpnService) {}

  startProxyServer(port: number = 8080): void {
    this.server = http.createServer(async (req, res) => {
      try {
        // Extrair URL de destino do parâmetro na consulta
        const parsedUrl = url.parse(req.url, true);
        const targetUrl = parsedUrl.query.url as string;
        
        if (!targetUrl) {
          res.writeHead(400);
          res.end('Missing target URL parameter');
          return;
        }

        // Verificar se uma VPN está conectada
        const vpnConnections = this.vpnService.getVpnConnections();
        let isConnectedToVpn = false;
        
        for (const vpn of vpnConnections) {
          const status = await this.vpnService.getVpnStatus(vpn.id);
          if (status.connected) {
            isConnectedToVpn = true;
            break;
          }
        }

        if (!isConnectedToVpn) {
          res.writeHead(503);
          res.end('No active VPN connection');
          return;
        }

        // Proxy do pedido para o URL alvo
        const parsed = url.parse(targetUrl);
        const options = {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
          path: parsed.path,
          method: req.method,
          headers: req.headers,
        };

        // Redirecionar para HTTPS ou HTTP dependendo do protocolo
        const proxyReq = (parsed.protocol === 'https:' ? https : http).request(
          options,
          (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        req.pipe(proxyReq);

        proxyReq.on('error', (error) => {
          this.logger.error(`Proxy error: ${error.message}`);
          res.writeHead(500);
          res.end(`Proxy error: ${error.message}`);
        });
      } catch (error) {
        this.logger.error(`Proxy server error: ${error.message}`);
        res.writeHead(500);
        res.end(`Server error: ${error.message}`);
      }
    });

    this.server.listen(port, () => {
      this.logger.log(`Proxy server running on port ${port}`);
    });
  }

  stopProxyServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          this.logger.log('Proxy server stopped');
          resolve();
        }
      });
    });
  }
}