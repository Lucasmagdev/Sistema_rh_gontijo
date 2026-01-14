# Documentação Completa do Sistema - TransitRoute RMBH

## 📋 Visão Geral do Projeto

**TransitRoute RMBH** é um sistema web de simulação e cálculo de rotas de transporte público (ônibus) para a Região Metropolitana de Belo Horizonte. O sistema permite:

1. **Cálculo de Rotas**: Simular rotas entre pontos de origem e destino
2. **Cadastro de Colaboradores**: Gerenciar colaboradores com endereços detalhados
3. **Integração**: Usar colaboradores como origem/destino nas rotas
4. **Visualização em Mapa**: Ver rotas calculadas em um mapa interativo

### Stack Tecnológica

- **Frontend**: React 18.3.1 com TypeScript
- **Build Tool**: Vite 5.4.2
- **Estilização**: Tailwind CSS 3.4.1
- **Animações**: Framer Motion 12.26.2
- **Mapas**: Leaflet 1.9.4 + React Leaflet 4.2.1
- **Ícones**: Lucide React 0.344.0
- **Armazenamento**: localStorage (pode ser migrado para Supabase)
- **Futuro**: Integração com Google Routes API

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── Header.tsx       # Cabeçalho com navegação por abas
│   ├── RouteInputPanel.tsx  # Painel de entrada de rotas
│   ├── RouteCard.tsx    # Card de exibição de rota
│   ├── MapView.tsx      # Visualização de mapa com Leaflet
│   ├── EmployeeList.tsx # Lista de colaboradores
│   ├── EmployeeForm.tsx # Formulário de cadastro/edição
│   └── EmployeeView.tsx # Visualização detalhada
├── services/            # Lógica de negócio e APIs
│   ├── routeService.ts  # Serviço principal de rotas
│   ├── routeServiceConfig.ts  # Configuração do serviço
│   ├── routeServiceMock.ts    # Implementação mockada
│   ├── routeServiceGoogle.ts  # Implementação Google Routes API
│   └── employeeService.ts     # CRUD de colaboradores
├── types/               # Definições TypeScript
│   ├── route.ts         # Tipos relacionados a rotas
│   └── employee.ts      # Tipos relacionados a colaboradores
├── data/                # Dados estáticos
│   └── locations.ts     # Localizações pré-cadastradas
├── utils/               # Funções utilitárias
│   └── addressToLocation.ts  # Conversão de endereço para Location
├── App.tsx              # Componente principal da aplicação
└── main.tsx             # Ponto de entrada
```

---

## 📦 Módulos Principais

### 1. Módulo de Rotas

#### Componentes

**RouteInputPanel** (`src/components/RouteInputPanel.tsx`)
- Permite selecionar origem e destino
- Suporta dois modos:
  - **Localização**: Seleciona de uma lista de pontos fixos
  - **Colaborador**: Seleciona um colaborador cadastrado (usa endereço principal)
- Exibe informações do colaborador selecionado
- Valida se colaborador tem endereço antes de calcular

**RouteCard** (`src/components/RouteCard.tsx`)
- Exibe informações de uma rota calculada
- Mostra: duração, custo, trajeto, integrações
- Badges visuais: "Mais Rápido", "Mais Econômico", "Equilibrado"
- Interativo: pode ser selecionado para visualização no mapa

**MapView** (`src/components/MapView.tsx`)
- Mapa interativo usando Leaflet
- Exibe marcadores de origem (verde) e destino (vermelho)
- Desenha a rota selecionada como uma polilinha
- Ajusta zoom automaticamente para mostrar origem e destino

#### Serviços

**routeService.ts** (Serviço Principal)
- Função `calculateRoutes(request: RouteRequest): Promise<Route[]>`
- Decide automaticamente qual implementação usar (mock ou Google API)
- Baseado na configuração em `routeServiceConfig.ts`

**routeServiceMock.ts** (Implementação Mock)
- Gera 3 rotas simuladas com diferentes características
- Calcula distância usando fórmula de Haversine
- Gera caminho poligonal aproximado
- Simula delay de 800ms para parecer real

**routeServiceGoogle.ts** (Implementação Google Routes API)
- Faz requisições HTTP para Google Routes API
- Converte resposta da API para formato interno
- Trata erros e validações
- Configurado para transporte público (TRANSIT mode)

**routeServiceConfig.ts** (Configuração)
- Centraliza configurações do serviço
- Flag `USE_MOCK` para alternar entre mock e API real
- Configuração de API Key via variável de ambiente

#### Tipos (`src/types/route.ts`)

```typescript
Location {
  id: string
  name: string
  city: string
  lat: number
  lng: number
}

BusLine {
  number: string
  name: string
  type: 'urbano' | 'metropolitano'
}

RouteSegment {
  busLine: BusLine
  from: string
  to: string
  duration: number  // em minutos
  distance: number  // em km
}

Route {
  id: string
  segments: RouteSegment[]
  totalDuration: number
  totalDistance: number
  totalCost: number
  integrations: number
  path: [number, number][]  // coordenadas [lat, lng]
  badges: ('economico' | 'rapido' | 'equilibrado')[]
}

RouteRequest {
  origin: Location
  destination: Location
}
```

#### Dados Estáticos (`src/data/locations.ts`)
- 15 localizações pré-cadastradas na RMBH
- Pontos de referência como Praça Sete, Savassi, Pampulha, etc.
- Coordenadas geográficas (lat/lng) para cada localização

---

### 2. Módulo de Colaboradores

#### Componentes

**EmployeeList** (`src/components/EmployeeList.tsx`)
- Lista todos os colaboradores cadastrados
- Busca por nome, email ou cargo
- Cards com informações resumidas
- Ações: Ver, Editar, Excluir
- Recarrega automaticamente após operações

**EmployeeForm** (`src/components/EmployeeForm.tsx`)
- Formulário completo de cadastro/edição
- Campos: nome, email, telefone, documento, cargo, departamento
- Gerenciamento de múltiplos endereços
- Validação de campos obrigatórios
- Validação de email
- Garante que pelo menos um endereço seja marcado como principal
- Permite adicionar/remover endereços dinamicamente

**EmployeeView** (`src/components/EmployeeView.tsx`)
- Visualização detalhada de um colaborador
- Exibe todos os dados cadastrados
- Mostra todos os endereços (destaca o principal)
- Informações de data de criação/atualização
- Botão para editar

#### Serviços

**employeeService.ts**
- CRUD completo usando localStorage
- Funções:
  - `getAllEmployees()`: Lista todos
  - `getEmployeeById(id)`: Busca por ID
  - `createEmployee(data)`: Cria novo
  - `updateEmployee(id, data)`: Atualiza existente
  - `deleteEmployee(id)`: Remove
- Simula delay assíncrono para parecer API real
- Preserva IDs de endereços durante edição

#### Tipos (`src/types/employee.ts`)

```typescript
Address {
  id: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  lat?: number
  lng?: number
  isMain: boolean
}

Employee {
  id: string
  name: string
  email: string
  phone: string
  document: string
  position: string
  department?: string
  addresses: Address[]
  createdAt: string  // ISO string
  updatedAt: string  // ISO string
}

EmployeeFormData {
  name: string
  email: string
  phone: string
  document: string
  position: string
  department?: string
  addresses: (Omit<Address, 'id'> & { id?: string })[]
}
```

#### Utilitários

**addressToLocation.ts**
- Converte `Address` (de colaborador) para `Location` (para rotas)
- Usa coordenadas do endereço se disponíveis
- Fallback para coordenadas padrão da cidade
- Cria nome descritivo combinando nome do colaborador e endereço

---

### 3. Componente Principal (App.tsx)

#### Estados Principais

```typescript
// Navegação
activeTab: 'routes' | 'employees'
employeeViewMode: 'list' | 'form' | 'view'

// Rotas
routes: Route[]
selectedRoute: Route | undefined
origin: Location | undefined
destination: Location | undefined
isLoading: boolean

// Colaboradores
selectedEmployee: Employee | undefined
employeeListRefresh: number  // trigger para recarregar lista
```

#### Fluxos Principais

**Fluxo de Cálculo de Rotas:**
1. Usuário seleciona origem e destino no `RouteInputPanel`
2. `handleCalculateRoutes` é chamado
3. `calculateRoutes` do serviço é executado
4. Rotas são exibidas em `RouteCard`s
5. Primeira rota é automaticamente selecionada
6. Mapa atualiza para mostrar rota selecionada

**Fluxo de Gerenciamento de Colaboradores:**
1. Usuário navega para aba "Colaboradores"
2. `EmployeeList` exibe todos os colaboradores
3. Usuário pode:
   - Ver detalhes → `EmployeeView`
   - Editar → `EmployeeForm` (modo edição)
   - Criar novo → `EmployeeForm` (modo criação)
   - Excluir → confirmação e remoção
4. Após salvar, volta para lista e recarrega dados

**Fluxo de Integração Colaborador-Rota:**
1. Na aba "Rotas", usuário seleciona modo "Colaborador"
2. Escolhe um colaborador da lista
3. Sistema busca endereço principal do colaborador
4. Converte endereço para `Location` usando `addressToLocation`
5. Usa essa `Location` no cálculo de rotas
6. Informações do colaborador são exibidas no painel

---

## 🎨 Padrões de Design e UI

### Estilo Visual

- **Cores Principais**: 
  - Vermelho gradiente: `#C4161C` → `#8B0F14`
  - Background: Gradiente cinza claro
  - Cards: Branco com backdrop-blur e transparência

### Componentes Visuais

- **Cards**: Bordas arredondadas (rounded-2xl), sombras, backdrop-blur
- **Botões**: Gradientes, hover effects, animações
- **Formulários**: Inputs com focus ring vermelho, validação visual
- **Badges**: Cores diferentes para tipos (verde=econômico, azul=rápido, roxo=equilibrado)

### Animações

- **Framer Motion**: Transições suaves entre telas
- **AnimatePresence**: Animações de entrada/saída
- **Hover Effects**: Escala e elevação em cards
- **Loading States**: Spinners e estados de carregamento

---

## 🔄 Fluxos de Dados

### Armazenamento

**Colaboradores:**
- Armazenados em `localStorage` com chave `'employees'`
- Formato: Array de objetos `Employee` em JSON
- Persiste entre sessões do navegador

**Rotas:**
- Calculadas sob demanda (não são persistidas)
- Dados mockados gerados dinamicamente
- Futuro: Cache opcional para rotas calculadas

### Comunicação entre Componentes

- **Props**: Dados passados de pai para filho
- **Callbacks**: Funções passadas como props para comunicação filho→pai
- **Estado Local**: Cada componente gerencia seu próprio estado quando apropriado
- **Estado Global**: `App.tsx` centraliza estado compartilhado

---

## 🔌 Integrações e APIs

### Google Routes API (Preparado, não ativo)

**Status**: Código pronto, mas usando mock por padrão

**Como ativar:**
1. Obter API Key do Google Cloud Console
2. Adicionar `VITE_GOOGLE_ROUTES_API_KEY` no `.env`
3. Alterar `USE_MOCK: false` em `routeServiceConfig.ts`

**Implementação:**
- `routeServiceGoogle.ts` contém toda a lógica
- Converte resposta da API para formato interno
- Tratamento de erros completo

### Supabase (Instalado, não utilizado)

- Biblioteca `@supabase/supabase-js` está instalada
- Pode ser usado para substituir localStorage no futuro
- Estrutura atual permite migração fácil

---

## 🛠️ Funcionalidades Detalhadas

### Cálculo de Rotas

1. **Entrada**: Origem e destino (Location ou Colaborador)
2. **Processamento**: 
   - Se colaborador: converte endereço para Location
   - Calcula distância (Haversine)
   - Gera múltiplas opções de rota
   - Calcula duração, distância, custo
3. **Saída**: Array de Route com diferentes características
4. **Visualização**: Mapa mostra rota selecionada

### Cadastro de Colaboradores

1. **Validações**:
   - Campos obrigatórios: nome, email, telefone, documento, cargo
   - Email válido (regex)
   - Pelo menos um endereço
   - Um endereço principal obrigatório
   - Campos de endereço obrigatórios: rua, número, bairro, cidade, estado, CEP

2. **Endereços**:
   - Múltiplos endereços por colaborador
   - Um endereço marcado como principal
   - Coordenadas opcionais (lat/lng)
   - Endereço principal usado nas rotas

3. **Operações**:
   - Criar: Gera ID único, timestamps
   - Editar: Preserva IDs de endereços existentes
   - Excluir: Remove do localStorage
   - Listar: Busca com filtro de texto

### Integração Colaborador-Rota

1. **Seleção**: Usuário escolhe colaborador como origem/destino
2. **Conversão**: `addressToLocation` converte Address → Location
3. **Fallback**: Se sem coordenadas, usa coordenadas padrão da cidade
4. **Exibição**: Mostra informações do colaborador no painel
5. **Cálculo**: Usa Location convertida no cálculo de rotas

---

## 📝 Convenções de Código

### Nomenclatura

- **Componentes**: PascalCase (`EmployeeList.tsx`)
- **Funções**: camelCase (`calculateRoutes`)
- **Tipos/Interfaces**: PascalCase (`Route`, `Employee`)
- **Constantes**: UPPER_SNAKE_CASE (`STORAGE_KEY`)
- **Arquivos**: camelCase para utilitários, PascalCase para componentes

### Estrutura de Componentes

```typescript
// 1. Imports
import ...

// 2. Interfaces/Types
interface Props { ... }

// 3. Componente
export function Component({ prop }: Props) {
  // 4. Estados
  const [state, setState] = useState()
  
  // 5. Effects
  useEffect(() => { ... }, [])
  
  // 6. Handlers
  const handle = () => { ... }
  
  // 7. Render
  return ( ... )
}
```

### Tratamento de Erros

- Try/catch em operações assíncronas
- Mensagens de erro amigáveis ao usuário
- Logs de erro no console para debug
- Validações antes de operações críticas

---

## 🚀 Como Usar o Sistema

### Desenvolvimento

```bash
npm install
npm run dev
```

### Build para Produção

```bash
npm run build
npm run preview
```

### Verificação de Tipos

```bash
npm run typecheck
```

---

## 🔮 Melhorias Futuras Possíveis

1. **Backend Real**: Migrar de localStorage para API/Supabase
2. **Autenticação**: Sistema de login e permissões
3. **Geocodificação**: Buscar coordenadas automaticamente via CEP
4. **Cache de Rotas**: Armazenar rotas calculadas
5. **Histórico**: Salvar rotas calculadas pelo usuário
6. **Exportação**: Exportar rotas em PDF/Excel
7. **Notificações**: Alertas sobre mudanças em rotas
8. **Multi-idioma**: Internacionalização
9. **Temas**: Modo escuro/claro
10. **PWA**: Transformar em Progressive Web App

---

## 📚 Dependências Principais

- **react/react-dom**: Framework UI
- **typescript**: Tipagem estática
- **vite**: Build tool e dev server
- **tailwindcss**: Estilização utilitária
- **framer-motion**: Animações
- **leaflet/react-leaflet**: Mapas interativos
- **lucide-react**: Ícones
- **@supabase/supabase-js**: (Instalado, não usado ainda)

---

## 🐛 Pontos de Atenção

1. **localStorage**: Dados são armazenados localmente, não sincronizam entre dispositivos
2. **Coordenadas**: Endereços sem coordenadas usam fallback da cidade
3. **API Google**: Requer configuração e API Key válida
4. **Validação**: Algumas validações são apenas no frontend
5. **Performance**: Muitos colaboradores podem afetar performance da lista

---

## 📞 Estrutura de Comunicação com IA

Ao conversar com ChatGPT sobre este projeto, você pode:

1. **Perguntar sobre funcionalidades**: "Como funciona o cálculo de rotas?"
2. **Solicitar melhorias**: "Adicione validação de CEP"
3. **Pedir explicações**: "Explique o fluxo de cadastro de colaboradores"
4. **Sugerir features**: "Como adicionar filtros na lista de colaboradores?"
5. **Debug**: "Por que a rota não aparece no mapa?"
6. **Refatoração**: "Como melhorar a performance do EmployeeList?"

Este documento serve como contexto completo para que o ChatGPT entenda toda a arquitetura, padrões e funcionalidades do sistema.

