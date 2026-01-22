# 🔧 Configuração do Supabase

## 📋 Passo a Passo para Configurar

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Crie uma conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - **Name**: Nome do projeto (ex: "Sistema RH Gontijo")
   - **Database Password**: Senha forte para o banco
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Aguarde a criação do projeto (pode levar alguns minutos)

### 2. Executar o Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `database/schema.sql` do projeto
4. Cole todo o conteúdo no editor SQL
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde a execução (deve mostrar "Success")

### 3. Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá:
   - **Project URL**: Copie este valor
   - **anon public key**: Copie este valor (não a service_role!)

### 4. Configurar Variáveis de Ambiente

1. Na raiz do projeto, crie um arquivo `.env` (se não existir)
2. Adicione as seguintes linhas:

```env
VITE_SUPABASE_URL=https://seu-projeto-id.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

3. Substitua pelos valores copiados no passo anterior
4. **IMPORTANTE**: O arquivo `.env` já está no `.gitignore`, então não será commitado

### 5. Verificar Configuração

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o console do navegador (F12)
3. Se tudo estiver configurado corretamente, não verá avisos sobre Supabase
4. Se houver avisos, verifique se as variáveis estão corretas

---

## 🔄 Migração de Dados do localStorage

Se você já tem dados salvos no localStorage e quer migrar para o Supabase:

### Opção 1: Migração Manual (Recomendado para poucos dados)

1. Exporte os dados do localStorage:
   - Abra o console do navegador
   - Execute: `localStorage.getItem('employees')`
   - Copie o JSON retornado

2. Use um script de migração (criar se necessário) ou importe manualmente pela interface

### Opção 2: Script de Migração Automática

Crie um script temporário para migrar os dados:

```typescript
// scripts/migrateToSupabase.ts
import { supabase } from '../src/lib/supabase';
import { getAllEmployees } from '../src/services/employeeService';

async function migrate() {
  const employees = await getAllEmployees();
  
  for (const emp of employees) {
    // Usar createEmployee do employeeServiceSupabase
    // ...
  }
}
```

---

## ✅ Verificação Final

Após configurar, teste:

1. **Criar um colaborador** pela interface
2. **Verificar no Supabase**:
   - Vá em **Table Editor** no dashboard
   - Verifique se o colaborador aparece na tabela `employees`
   - Verifique se os endereços aparecem na tabela `addresses`
   - Verifique se os cartões aparecem na tabela `bus_cards`

3. **Testar busca**: Busque o colaborador criado
4. **Testar atualização**: Edite o colaborador
5. **Testar exclusão**: Delete o colaborador

---

## 🚨 Troubleshooting

### Erro: "Invalid API key"
- Verifique se copiou a chave **anon public**, não a service_role
- Verifique se não há espaços extras nas variáveis de ambiente
- Reinicie o servidor de desenvolvimento após alterar `.env`

### Erro: "relation does not exist"
- O schema SQL não foi executado
- Execute o arquivo `database/schema.sql` no SQL Editor

### Erro: "new row violates row-level security policy"
- As políticas RLS estão bloqueando
- Verifique se está autenticado (se usar auth)
- Ou ajuste as políticas no schema SQL

### Dados não aparecem
- Verifique se está usando o serviço correto (employeeServiceSupabase)
- Verifique o console do navegador para erros
- Verifique a aba Network no DevTools para ver requisições

---

## 📚 Próximos Passos

Após configurar o Supabase:

1. **Substituir imports**: Troque `employeeService` por `employeeServiceSupabase` nos componentes
2. **Testar todas as funcionalidades**
3. **Configurar autenticação** (opcional): Integrar Supabase Auth
4. **Otimizar queries**: Usar a função `get_employee_full_data()` do banco

---

## 🔐 Segurança

- **NUNCA** commite o arquivo `.env` no git
- **NUNCA** use a chave `service_role` no frontend
- Use apenas a chave `anon public` no frontend
- Configure RLS adequadamente para proteger seus dados
- Revise as políticas de segurança no Supabase

