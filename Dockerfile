FROM node:20-alpine

WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro para aproveitar o cache do Docker
COPY package*.json ./

# Instalar dependências de produção
RUN npm install --production

# Copiar o resto dos arquivos da aplicação
COPY . .

# Expor a porta da aplicação
EXPOSE 3000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Comando para executar a aplicação
CMD ["node", "server.js"]

# Metadados da imagem
LABEL maintainer="guilherme@setupautomatizado.com.br"
LABEL version="1.0"
LABEL description="Manychat Display - Aplicação interativa para exibição de vídeos com interface touch-friendly"
LABEL platform="linux/amd64"