#!/bin/bash
# /app/scripts/setup-routing.sh

INTERFACE=$1

if [ -z "$INTERFACE" ]; then
  echo "Usage: $0 <interface>"
  exit 1
fi

# Habilitar IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward

# Configurar iptables para NAT
iptables -t nat -A POSTROUTING -o $INTERFACE -j MASQUERADE
iptables -A FORWARD -i eth0 -o $INTERFACE -j ACCEPT
iptables -A FORWARD -i $INTERFACE -o eth0 -m state --state RELATED,ESTABLISHED -j ACCEPT

echo "Routing setup completed for interface $INTERFACE"