# Integração com Google Routes API

## 📋 Visão Geral

O sistema está preparado para integração com a Google Routes API. Atualmente, está usando dados simulados (mock), mas pode ser facilmente trocado para usar a API real do Google.

## 🔧 Como Ativar a Integração

### 1. Obter API Key do Google

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Routes API** no seu projeto
4. Vá em **APIs & Services > Credentials**
5. Crie uma nova **API Key** ou use uma existente
6. Configure as restrições de segurança da API Key (recomendado)

### 2. Configurar Variável de Ambiente

Crie um arquivo `.env` na raiz do projeto (se não existir) e adicione:

```env
VITE_GOOGLE_ROUTES_API_KEY=sua_api_key_aqui
```

### 3. Ativar a Integração

Edite o arquivo `src/services/routeServiceConfig.ts`:

```typescript
export const ROUTE_SERVICE_CONFIG = {
  USE_MOCK: false, // Altere para false
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_ROUTES_API_KEY || '',
  GOOGLE_API_ENDPOINT: 'https://routes.googleapis.com/directions/v2:computeRoutes',
};
```

### 4. Reiniciar o Servidor

```bash
npm run dev
```

## 📚 Estrutura do Código

O código está organizado para facilitar a troca entre mock e API real:

```
src/services/
├── routeService.ts          # Serviço principal (decide qual usar)
├── routeServiceConfig.ts    # Configuração centralizada
├── routeServiceMock.ts      # Implementação com dados simulados
└── routeServiceGoogle.ts    # Implementação com Google Routes API
```

## 🔄 Como Funciona

1. **routeService.ts**: Função principal que verifica a configuração e chama a implementação correta
2. **routeServiceMock.ts**: Retorna dados simulados para desenvolvimento/testes
3. **routeServiceGoogle.ts**: Faz chamadas reais para a API do Google e converte os dados

## ⚙️ Configurações da API

A implementação do Google Routes está configurada para:
- **Travel Mode**: `TRANSIT` (transporte público)
- **Routing Preference**: `TRAFFIC_AWARE` (considera trânsito)
- **Alternative Routes**: `true` (retorna múltiplas opções)
- **Language**: `pt-BR`
- **Units**: `METRIC` (quilômetros, metros)

## 💰 Custos

A Google Routes API tem um modelo de cobrança baseado em uso:
- **Primeiros $200/mês**: Grátis (créditos mensais)
- **Após**: Consulte a [tabela de preços](https://developers.google.com/maps/billing-and-pricing/pricing#routes)

## 🛠️ Personalização

Você pode personalizar a integração editando `routeServiceGoogle.ts`:

- Modificar parâmetros da requisição
- Ajustar a conversão de dados
- Adicionar tratamento de erros específico
- Implementar cache de rotas

## 🧪 Testando

Para testar sem custos, mantenha `USE_MOCK: true` durante o desenvolvimento.

Quando estiver pronto para testar com a API real:
1. Configure a API Key
2. Altere `USE_MOCK: false`
3. Teste com rotas reais
4. Monitore os custos no Google Cloud Console

## 📝 Notas Importantes

- A API Key deve ser mantida segura (não commitar no Git)
- Adicione `.env` ao `.gitignore`
- Configure restrições de API Key no Google Cloud Console
- Monitore o uso para evitar custos inesperados
- A API do Google pode ter limites de requisições por segundo

## 🔗 Links Úteis

- [Documentação Google Routes API](https://developers.google.com/maps/documentation/routes)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Tabela de Preços](https://developers.google.com/maps/billing-and-pricing/pricing#routes)
- [Guia de Início Rápido](https://developers.google.com/maps/documentation/routes/quickstart)

