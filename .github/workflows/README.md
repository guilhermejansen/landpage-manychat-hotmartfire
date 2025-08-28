# GitHub Actions - Build Automático Docker

## Como Funciona

Este workflow automatiza o build e push da imagem Docker sempre que você:

- ✅ Faz push para a branch `main` ou `master`
- ✅ Cria um Pull Request para `main` ou `master`

## O que Acontece

1. **Checkout** do código
2. **Build** da imagem Docker
3. **Push** automático para o GitHub Container Registry (ghcr.io)
4. **Cache** para builds mais rápidos

## Configuração Automática

✅ **Não precisa configurar nada!** O workflow usa:
- `GITHUB_TOKEN` (automático)
- Nome do repositório como nome da imagem
- GitHub Container Registry como destino

## Imagens Geradas

- **Branch main/master**: `ghcr.io/seu-usuario/seu-repo:latest`
- **Outras branches**: `ghcr.io/seu-usuario/seu-repo:branch-name`
- **Commits específicos**: `ghcr.io/seu-usuario/seu-repo:main-sha123`

## Como Usar

1. **Push para main/master** = Build + Push automático
2. **Pull Request** = Apenas build (sem push)
3. **Ver logs** em Actions > Build e Push Docker Image

## Personalização

Para mudar o registry ou nome da imagem, edite as variáveis no workflow:
```yaml
env:
  REGISTRY: ghcr.io  # ou docker.io para Docker Hub
  IMAGE_NAME: ${{ github.repository }}  # ou nome customizado
```
