# Manychat Display

Aplicação interativa para exibição de vídeos com interface touch-friendly para o Hotmart Fire 2025.

## Requisitos

- Docker 20.10.0+
- Docker Swarm inicializado
- Traefik configurado como gateway para Docker Swarm

## Configuração do Docker Swarm

### 1. Inicializar Docker Swarm (se ainda não estiver inicializado)

```bash
docker swarm init
```

### 2. Criar rede para Traefik (se ainda não existir)

```bash
docker network create --driver=overlay --attachable traefik-public
```

## Implantação

### 1. Construir a imagem

```bash
docker build -t manychat-display:latest .
```

### 2. Implantar com Docker Swarm

```bash
docker stack deploy -c docker-compose.yml manychat
```

### 3. Verificar a implantação

```bash
docker stack ps manychat
```

## Monitoramento

### Endpoint de Saúde

O aplicativo possui um endpoint de saúde em `/health` que retorna informações sobre o estado do sistema. Este endpoint é usado pelo Docker para verificar se o container está saudável.

Exemplo de resposta:

```json
{
  "status": "UP",
  "uptime": "3600 segundos",
  "version": "1.0",
  "stats": {
    "requests": {
      "total": 1500,
      "success": 1450,
      "error": 50
    },
    "videoStreams": {
      "total": 75,
      "active": 3
    }
  },
  "memory": {
    "rss": 56123392,
    "heapTotal": 34271232,
    "heapUsed": 27011864,
    "external": 1832972,
    "arrayBuffers": 210534
  }
}
```

## Configuração Traefik

O serviço está configurado para usar Traefik como proxy reverso com as seguintes funcionalidades:

- Compressão de resposta HTTP
- Buffer para arquivos grandes (vídeos)
- TLS automático com Let's Encrypt
- Health checking automático

## Estrutura de Volume

O volume Docker `manychat-videos` é usado para persistir os vídeos entre atualizações e redeploys, garantindo que os vídeos não precisem ser reconstruídos com a imagem.

## Escalabilidade

O serviço está configurado para executar 2 réplicas por padrão, permitindo alta disponibilidade e balanceamento de carga. O Docker Swarm gerencia automaticamente a distribuição das requisições entre as réplicas.

## Atualizações

As atualizações são configuradas com uma política rolling para minimizar o tempo de inatividade:

- Atualização de uma réplica por vez
- 10 segundos de espera entre atualizações
- Ordem "start-first" para garantir disponibilidade contínua
- Rollback automático em caso de falha

## Configurações Avançadas

Ajuste os parâmetros no arquivo `docker-compose.yml` conforme necessário:

- **replicas**: Número de instâncias em execução
- **restart_policy**: Comportamento em caso de falha
- **healthcheck**: Configuração de verificação de saúde
- **traefik.http.routers.manychat.rule**: Hostname para acesso ao serviço

## Características

- ✨ Interface moderna e responsiva
- 📱 Otimizada para telas de toque
- 🎬 Reprodução de vídeos em tela cheia
- 🌐 Funciona offline com Service Worker
- 📦 Fácil de configurar e implantar com Docker
- 🔄 Animações e efeitos visuais atraentes
- 🎨 Design limpo e organizado

## Pré-requisitos

- Node.js versão 20 ou superior
- Docker (opcional, para execução containerizada)

## Estrutura do Projeto

```
manychat-display/
├── public/
│   ├── images/
│   │   ├── logo.png
│   │   ├── banner.png
│   │   ├── instagram.png
│   │   ├── o-que-e.png
│   │   ├── como-ajuda.png
│   │   ├── lakto.png
│   │   ├── rotina-saude.png
│   │   ├── todos-videos.png
│   │   ├── voltar.png
│   │   └── background.png
│   ├── videos/
│   │   ├── video1.mp4
│   │   ├── video2.mp4
│   │   ├── video3.mp4
│   │   └── video4.mp4
│   ├── css/
│   │   ├── reset.css
│   │   ├── animations.css
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── index.html
├── server.js
├── package.json
├── README.md
└── Dockerfile
```

## Configuração e Execução

### Método 1: Execução Local com Node.js

1. Clone o repositório:
   ```bash
   git clone <url-repositorio>
   cd manychat-display
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```

4. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

### Método 2: Execução com Docker

1. Construa a imagem Docker:
   ```bash
   docker build -t manychat-display .
   ```

2. Execute o container:
   ```bash
   docker run -p 3000:3000 -d manychat-display
   ```

3. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

## Personalização

### Substituição de Vídeos

1. Coloque seus próprios vídeos na pasta `public/videos/`
2. Atualize as referências no arquivo `index.html` para apontar para seus novos vídeos

### Alteração de Imagens

1. Substitua as imagens na pasta `public/images/` mantendo os mesmos nomes de arquivo
2. Se precisar usar nomes diferentes, atualize as referências no arquivo `index.html`

### Personalização de Cores e Temas

1. Edite as variáveis CSS no início do arquivo `public/css/style.css`:
   ```css
   :root {
       --primary-color: #0078D7;
       --secondary-color: #50E6FF;
       --dark-color: #1A1A1A;
       --light-color: #F0F0F0;
       --text-color: #333333;
       --shadow-color: rgba(0, 0, 0, 0.2);
   }
   ```

## Recursos Adicionais

- **Service Worker**: A aplicação inclui um Service Worker que permite funcionamento offline após a primeira visita
- **Animações Responsivas**: Efeitos visuais que se adaptam a diferentes tamanhos de tela
- **Otimização para Toque**: Interface especialmente projetada para interação por toque
- **Cache Inteligente**: Os recursos essenciais são armazenados em cache para carregamento rápido

## Boas Práticas de Implementação

Para exibição em telas grandes ou quiosques:

1. **Modo Quiosque**:
   - No Chrome/Chromium, você pode iniciar em modo quiosque com o comando:
   ```
   chrome --kiosk http://localhost:3000
   ```

2. **Tela Cheia Automática**:
   - A aplicação suporta modo de tela cheia que pode ser ativado automaticamente

3. **Reinicialização Automática**:
   - Para ambiente de produção, configure um script para reiniciar o navegador periodicamente

## Suporte e Contribuição

Para relatar problemas ou contribuir com melhorias, por favor abra uma issue no repositório do GitHub.

## Autor

Guilherme Jansen - Web Developer

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.