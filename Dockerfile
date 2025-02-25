FROM node:18-alpine AS builder

# Instalando dependências para o pptp e ferramentas de rede
RUN apk add --no-cache iptables iproute2 ppp procps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm i

COPY . .
RUN npm run build

FROM node:18-alpine AS runner

# Instalando dependências para o pptp e ferramentas de rede no container final
RUN apk add --no-cache iptables iproute2 ppp procps

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Adicionando scripts para configuração PPTP e iptables
COPY ./scripts /usr/local/bin
RUN chmod +x /usr/local/bin/*.sh


EXPOSE 3000

CMD ["npm", "run", "start:prod"]