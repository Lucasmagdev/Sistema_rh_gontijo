# 🚗 Migração UberGon para Supabase

## ✅ Arquivos Criados

### 1. `database/schema_ubergon.sql`
Arquivo SQL completo para criar as tabelas do UberGon no banco de dados Supabase.

**Tabelas criadas:**
- `rotas_motoristas` - Rotas de motoristas (caronas)
- `paradas_rotas` - Paradas intermediárias nas rotas
- `pontos_embarque` - Pontos fixos de embarque
- `atribuicoes_rotas_motoristas` - Atribuições de passageiros às rotas

**Características:**
- ✅ Triggers para atualização automática de `atualizado_em`
- ✅ Índices para performance
- ✅ Row Level Security (RLS) configurado
- ✅ Políticas de segurança para usuários autenticados
- ✅ Relacionamentos com CASCADE

### 2. `src/services/driverRouteServiceSupabase.ts`
Serviço migrado para usar Supabase com fallback automático para localStorage.

**Funcionalidades:**
- ✅ Todas as funções do serviço original
- ✅ Fallback automático se Supabase não estiver configurado
- ✅ Conversão automática entre formatos TypeScript e banco
- ✅ Tratamento de erros robusto

## 📋 Como Executar

### Passo 1: Executar o SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `database/schema_ubergon.sql`
4. Execute o script

### Passo 2: Verificar Configuração

Certifique-se de que as variáveis de ambiente estão configuradas no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_aqui
```

### Passo 3: Testar

O sistema automaticamente:
- ✅ Usará Supabase se estiver configurado
- ✅ Fará fallback para localStorage se não estiver configurado
- ✅ Migrará dados automaticamente na primeira execução

## 🔄 Migração de Dados

Os dados existentes no localStorage serão mantidos até que você:
1. Execute o SQL no banco
2. Configure as variáveis de ambiente
3. O sistema começará a usar o banco automaticamente

**Nota:** Dados antigos no localStorage não serão migrados automaticamente. Você precisará recriar as rotas no sistema após a migração.

## 📊 Estrutura das Tabelas

### rotas_motoristas
- `id` (UUID) - ID único
- `motorista_id` (UUID) - Referência ao colaborador motorista
- `nome` (VARCHAR) - Nome da rota
- `origem_dados` (JSONB) - Dados da origem
- `destino_dados` (JSONB) - Dados do destino
- `caminho` (JSONB) - Array de coordenadas [lat, lng]
- `cor` (VARCHAR) - Cor hex da rota
- `capacidade` (INTEGER) - Capacidade de passageiros
- `passageiros_atuais` (JSONB) - IDs dos passageiros
- `ativa` (BOOLEAN) - Se a rota está ativa
- `horarios` (JSONB) - Horários opcionais
- `criado_em`, `atualizado_em` (TIMESTAMP)

### paradas_rotas
- `id` (UUID) - ID único
- `rota_motorista_id` (UUID) - Referência à rota
- `localizacao_dados` (JSONB) - Dados da localização
- `nome` (VARCHAR) - Nome da parada
- `ordem` (INTEGER) - Ordem na rota
- `ponto_embarque_fixo` (BOOLEAN) - Se é ponto fixo
- `horario` (VARCHAR) - Horário da parada (HH:mm)
- `criado_em`, `atualizado_em` (TIMESTAMP)

### pontos_embarque
- `id` (UUID) - ID único
- `localizacao_dados` (JSONB) - Dados da localização
- `nome` (VARCHAR) - Nome do ponto
- `descricao` (TEXT) - Descrição opcional
- `rotas_ids` (JSONB) - IDs das rotas que passam por este ponto
- `ativo` (BOOLEAN) - Se o ponto está ativo
- `criado_em`, `atualizado_em` (TIMESTAMP)

### atribuicoes_rotas_motoristas
- `id` (UUID) - ID único
- `colaborador_id` (UUID) - Referência ao colaborador
- `rota_motorista_id` (UUID) - Referência à rota
- `atribuida_em` (TIMESTAMP) - Data de atribuição
- `ativa` (BOOLEAN) - Se a atribuição está ativa
- `criado_em`, `atualizado_em` (TIMESTAMP)

## ✅ Status da Migração

- ✅ Schema SQL criado
- ✅ Serviço migrado para Supabase
- ✅ Fallback para localStorage implementado
- ✅ Componentes atualizados para usar novo serviço
- ✅ Sem breaking changes - interface mantida

## 🚀 Próximos Passos

1. Execute o SQL no Supabase
2. Configure as variáveis de ambiente
3. Teste a criação de rotas
4. Verifique se os dados estão sendo salvos no banco

