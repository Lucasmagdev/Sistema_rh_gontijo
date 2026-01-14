# Documentação da Aba de Gestão - TransitRoute RMBH

## 📋 Visão Geral

A aba de **Gestão** é um painel administrativo centralizado que fornece uma visão geral do sistema e prepara o terreno para funcionalidades administrativas futuras. Foi implementada seguindo os mesmos padrões arquiteturais, visuais e estruturais das outras abas do sistema (Rotas e Colaboradores).

---

## 🎯 Objetivo da Aba

A aba de Gestão serve como:
- **Dashboard administrativo** com métricas e estatísticas do sistema
- **Hub central** para futuras funcionalidades administrativas
- **Painel de controle** para configurações e gerenciamento do sistema
- **Ponto de entrada** para módulos administrativos avançados

---

## 🏗️ Estrutura Implementada

### 1. **Header da Aba**
- Título: "Gestão do Sistema"
- Descrição: "Painel administrativo e configurações"
- Ícone: Settings (engrenagem)
- Design: Card branco com backdrop-blur, gradiente vermelho no ícone

### 2. **Cards de Estatísticas (4 cards)**

#### Card 1: Colaboradores
- **Título**: "Colaboradores"
- **Valor**: Total de colaboradores cadastrados (dinâmico, busca do localStorage)
- **Ícone**: Users
- **Cor**: Azul (text-blue-600, bg-blue-100)
- **Descrição**: "Total cadastrado"
- **Fonte de Dados**: `getAllEmployees()` do `employeeService`

#### Card 2: Rotas Calculadas
- **Título**: "Rotas Calculadas"
- **Valor**: "0" (estático por enquanto)
- **Ícone**: Route
- **Cor**: Verde (text-green-600, bg-green-100)
- **Descrição**: "Hoje"
- **Nota**: Preparado para integração futura com histórico de rotas

#### Card 3: Atividade
- **Título**: "Atividade"
- **Valor**: "Alta" (estático por enquanto)
- **Ícone**: Activity
- **Cor**: Roxo (text-purple-600, bg-purple-100)
- **Descrição**: "Últimas 24h"
- **Nota**: Preparado para métricas de uso do sistema

#### Card 4: Performance
- **Título**: "Performance"
- **Valor**: "98%" (estático por enquanto)
- **Ícone**: TrendingUp
- **Cor**: Laranja (text-orange-600, bg-orange-100)
- **Descrição**: "Uptime do sistema"
- **Nota**: Preparado para métricas de performance

### 3. **Funcionalidades Administrativas (8 módulos)**

Cada módulo é representado por um card clicável com:
- Ícone grande em gradiente vermelho
- Badge de status (Disponível / Em breve / Desabilitado)
- Título e descrição
- Estado atual: Todos marcados como "Em breve"

#### Módulo 1: Configurações do Sistema
- **ID**: `settings`
- **Título**: "Configurações do Sistema"
- **Descrição**: "Gerencie configurações gerais, parâmetros e preferências do sistema"
- **Ícone**: Settings
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Configurações gerais do sistema
  - Parâmetros de roteamento
  - Preferências de visualização
  - Configurações de integração

#### Módulo 2: Relatórios e Análises
- **ID**: `reports`
- **Título**: "Relatórios e Análises"
- **Descrição**: "Gere relatórios detalhados sobre rotas, colaboradores e uso do sistema"
- **Ícone**: BarChart3
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Relatórios de rotas calculadas
  - Análise de uso de colaboradores
  - Estatísticas de performance
  - Exportação de dados (PDF, Excel, CSV)

#### Módulo 3: Gestão de Usuários
- **ID**: `users`
- **Título**: "Gestão de Usuários"
- **Descrição**: "Administre usuários, permissões e acessos ao sistema"
- **Ícone**: Shield
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - CRUD de usuários
  - Gestão de permissões e roles
  - Controle de acesso por funcionalidade
  - Histórico de login
  - Bloqueio/desbloqueio de usuários

#### Módulo 4: Notificações
- **ID**: `notifications`
- **Título**: "Notificações"
- **Descrição**: "Configure alertas e notificações do sistema"
- **Ícone**: Bell
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Configuração de alertas
  - Notificações por email
  - Notificações em tempo real
  - Preferências de notificação por usuário

#### Módulo 5: Logs e Auditoria
- **ID**: `logs`
- **Título**: "Logs e Auditoria"
- **Descrição**: "Visualize logs de atividades e auditoria do sistema"
- **Ícone**: FileText
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Visualização de logs do sistema
  - Auditoria de ações dos usuários
  - Filtros e buscas em logs
  - Exportação de logs
  - Alertas de atividades suspeitas

#### Módulo 6: Backup e Restauração
- **ID**: `backup`
- **Título**: "Backup e Restauração"
- **Descrição**: "Gerencie backups e restaurações de dados"
- **Ícone**: Database
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Agendamento de backups automáticos
  - Backup manual
  - Restauração de dados
  - Histórico de backups
  - Download de backups

#### Módulo 7: Agendamentos
- **ID**: `schedules`
- **Título**: "Agendamentos"
- **Descrição**: "Configure agendamentos automáticos e tarefas programadas"
- **Ícone**: Calendar
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Agendamento de tarefas
  - Jobs automáticos
  - Cronograma de execuções
  - Histórico de execuções

#### Módulo 8: Integrações
- **ID**: `integrations`
- **Título**: "Integrações"
- **Descrição**: "Gerencie integrações com APIs externas e serviços"
- **Ícone**: Route
- **Status**: Coming Soon
- **Funcionalidades Futuras**:
  - Configuração de APIs externas
  - Google Routes API
  - Integração com sistemas de folha de pagamento
  - Webhooks
  - Status de integrações

### 4. **Seção de Informações do Sistema**

Card informativo com:
- **Título**: "Sistema Operacional"
- **Ícone**: Activity (azul)
- **Conteúdo**:
  - Versão do Sistema: 1.0.0
  - Última Atualização: Data atual (dinâmica)
  - Status: "Operacional" (verde)
- **Mensagem**: Informa que o painel está em desenvolvimento contínuo

---

## 🎨 Padrões de Design Implementados

### Cores e Estilos
- **Cards**: `bg-white/90 backdrop-blur-xl rounded-2xl`
- **Bordas**: `border border-gray-200`
- **Sombras**: `shadow-lg hover:shadow-2xl`
- **Gradiente Principal**: `from-[#C4161C] to-[#8B0F14]` (vermelho)
- **Animações**: Framer Motion com delays escalonados

### Layout
- **Grid Responsivo**: 
  - Estatísticas: 1 coluna (mobile) → 2 (tablet) → 4 (desktop)
  - Funcionalidades: 1 coluna (mobile) → 2 (tablet) → 4 (desktop)
- **Espaçamento**: `gap-6` entre cards
- **Padding**: `p-6` nos cards principais

### Animações
- **Entrada**: `opacity: 0, y: 20` → `opacity: 1, y: 0`
- **Hover**: `y: -5, scale: 1.02`
- **Delays**: Escalonados por índice (0.05s, 0.1s, etc.)
- **Transições**: `duration-300` para todas as animações

---

## 🔧 Arquitetura Técnica

### Componente Principal
**Arquivo**: `src/components/ManagementList.tsx`

### Dependências
- `react` (useState, useEffect)
- `framer-motion` (animações)
- `lucide-react` (ícones)
- `employeeService` (para buscar dados de colaboradores)

### Interfaces TypeScript

```typescript
interface ManagementListProps {
  // Props podem ser adicionadas no futuro
}

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description?: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'available' | 'coming-soon' | 'disabled';
  onClick?: () => void;
}
```

### Estados
- `employees`: Array de colaboradores (para estatísticas)
- `isLoading`: Estado de carregamento

### Funções Principais
- `loadData()`: Carrega dados de colaboradores
- `getStatusBadge()`: Retorna badge visual baseado no status

---

## 📊 Integração com o Sistema

### No Header (`src/components/Header.tsx`)
- Adicionado botão "Gestão" com ícone Settings
- Integrado ao sistema de navegação por abas
- Mantém padrões visuais das outras abas

### No App Principal (`src/App.tsx`)
- Tipo `ActiveTab` expandido: `'routes' | 'employees' | 'management'`
- Renderização condicional com AnimatePresence
- Animação de entrada: `x: 20` → `x: 0`
- Animação de saída: `x: 0` → `x: -20`

---

## 🚀 Funcionalidades Futuras - Detalhamento por Módulo

### 1. Configurações do Sistema
**O que implementar:**
- Formulário de configurações gerais
- Toggle de funcionalidades
- Configurações de API keys
- Preferências de visualização
- Configurações de notificações padrão

**Componentes necessários:**
- `SettingsPanel.tsx`
- `SettingsForm.tsx`
- `SettingsService.ts` (serviço para salvar/carregar)

**Dados a gerenciar:**
- Configurações de roteamento
- Limites e thresholds
- Preferências de UI
- Configurações de integração

---

### 2. Relatórios e Análises
**O que implementar:**
- Dashboard de métricas
- Gráficos de uso (Chart.js ou similar)
- Filtros por período
- Exportação de relatórios
- Relatórios agendados

**Componentes necessários:**
- `ReportsPanel.tsx`
- `ReportGenerator.tsx`
- `Charts/` (pasta com componentes de gráficos)
- `ReportsService.ts`

**Dados a exibir:**
- Rotas calculadas por período
- Colaboradores mais ativos
- Uso do sistema por dia/semana/mês
- Performance de rotas

---

### 3. Gestão de Usuários
**O que implementar:**
- Lista de usuários
- Formulário de criação/edição
- Atribuição de roles/permissões
- Histórico de login
- Bloqueio/desbloqueio

**Componentes necessários:**
- `UsersList.tsx`
- `UserForm.tsx`
- `UserView.tsx`
- `PermissionsPanel.tsx`
- `UsersService.ts`

**Dados a gerenciar:**
- Informações do usuário
- Roles (admin, operador, gestor, etc.)
- Permissões por funcionalidade
- Histórico de ações

---

### 4. Notificações
**O que implementar:**
- Configuração de tipos de notificação
- Preferências por usuário
- Teste de envio
- Histórico de notificações
- Templates de notificação

**Componentes necessários:**
- `NotificationsPanel.tsx`
- `NotificationSettings.tsx`
- `NotificationHistory.tsx`
- `NotificationsService.ts`

**Dados a gerenciar:**
- Tipos de notificação
- Preferências de usuário
- Templates
- Histórico de envios

---

### 5. Logs e Auditoria
**O que implementar:**
- Visualizador de logs
- Filtros avançados (data, usuário, ação, tipo)
- Busca em logs
- Exportação de logs
- Alertas de atividades suspeitas

**Componentes necessários:**
- `LogsViewer.tsx`
- `LogsFilters.tsx`
- `AuditTrail.tsx`
- `LogsService.ts`

**Dados a exibir:**
- Timestamp
- Usuário
- Ação realizada
- Dados afetados
- IP/Origem

---

### 6. Backup e Restauração
**O que implementar:**
- Agendamento de backups
- Backup manual
- Lista de backups disponíveis
- Restauração seletiva
- Download de backups

**Componentes necessários:**
- `BackupPanel.tsx`
- `BackupSchedule.tsx`
- `BackupList.tsx`
- `RestoreDialog.tsx`
- `BackupService.ts`

**Dados a gerenciar:**
- Agendamentos de backup
- Histórico de backups
- Status de backups
- Arquivos de backup

---

### 7. Agendamentos
**O que implementar:**
- Criação de tarefas agendadas
- Cronograma visual
- Histórico de execuções
- Status de jobs
- Edição/cancelamento de agendamentos

**Componentes necessários:**
- `SchedulesPanel.tsx`
- `ScheduleForm.tsx`
- `ScheduleCalendar.tsx`
- `ScheduleHistory.tsx`
- `SchedulesService.ts`

**Dados a gerenciar:**
- Tarefas agendadas
- Frequência (diária, semanal, mensal)
- Última execução
- Próxima execução
- Status (ativo/inativo)

---

### 8. Integrações
**O que implementar:**
- Lista de integrações disponíveis
- Configuração de APIs
- Status de conexão
- Teste de integração
- Histórico de sincronizações

**Componentes necessários:**
- `IntegrationsPanel.tsx`
- `IntegrationCard.tsx`
- `IntegrationConfig.tsx`
- `IntegrationStatus.tsx`
- `IntegrationsService.ts`

**Dados a gerenciar:**
- APIs configuradas
- Status de conexão
- Última sincronização
- Erros de integração
- Configurações de autenticação

---

## 📝 Notas de Implementação

### Estado Atual
- ✅ Estrutura visual completa
- ✅ Navegação integrada
- ✅ Animações implementadas
- ✅ Design responsivo
- ⏳ Funcionalidades marcadas como "Em breve"

### Próximos Passos Sugeridos
1. Priorizar módulos por necessidade de negócio
2. Criar serviços específicos para cada módulo
3. Implementar componentes individuais
4. Adicionar rotas/modais para cada funcionalidade
5. Integrar com backend quando disponível

### Considerações de Escalabilidade
- Cada módulo pode ser implementado independentemente
- Estrutura permite adicionar novos módulos facilmente
- Padrões estabelecidos facilitam manutenção
- Desacoplamento garante que mudanças não afetem outras abas

---

## 🔗 Arquivos Relacionados

- `src/components/ManagementList.tsx` - Componente principal
- `src/components/Header.tsx` - Navegação (atualizado)
- `src/App.tsx` - Renderização (atualizado)
- `src/services/employeeService.ts` - Serviço usado para estatísticas

---

## 📌 Resumo para Destrinchamento

A aba de Gestão é um **painel administrativo preparado para expansão** com:

1. **4 Cards de Estatísticas** (1 dinâmico, 3 estáticos preparados)
2. **8 Módulos Administrativos** (todos preparados, nenhum implementado ainda)
3. **Seção de Informações do Sistema** (versão, status, atualização)

Cada módulo pode ser desenvolvido independentemente seguindo os padrões estabelecidos no projeto. A estrutura está pronta para receber as implementações específicas de cada funcionalidade administrativa.

