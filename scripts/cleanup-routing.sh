#!/bin/bash
# /usr/local/bin/cleanup-routing.sh

# Remover regras de iptables
iptables -t nat -F POSTROUTING
iptables -F FORWARD

# Desabilitar IP forwarding
echo 0 > /proc/sys/net/ipv4/ip_forward

echo "Routing cleanup completed"