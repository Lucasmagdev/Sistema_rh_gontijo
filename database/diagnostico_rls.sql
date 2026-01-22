-- ============================================
-- SCRIPT DE DIAGNÓSTICO E CORREÇÃO DE RLS
-- ============================================
-- 
-- Se você não está usando autenticação ainda, 
-- as políticas RLS podem estar bloqueando as consultas.
-- Este script cria políticas temporárias para permitir acesso sem autenticação.
-- 
-- ATENÇÃO: Use apenas para desenvolvimento/testes!
-- Para produção, configure autenticação adequada.
-- ============================================

-- Verificar políticas atuais
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Remover políticas que exigem autenticação
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar endereços" ON enderecos;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar cartões" ON cartoes_onibus;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar localizações" ON localizacoes;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar linhas" ON linhas_onibus;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar rotas atribuídas" ON rotas_atribuidas;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar configurações" ON configuracoes_sistema;

-- Criar políticas que permitem acesso público (APENAS PARA DESENVOLVIMENTO)
-- ⚠️ NÃO USE EM PRODUÇÃO SEM AUTENTICAÇÃO!

CREATE POLICY "Permitir acesso público a colaboradores (DEV)"
    ON colaboradores FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a endereços (DEV)"
    ON enderecos FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a cartões (DEV)"
    ON cartoes_onibus FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a localizações (DEV)"
    ON localizacoes FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a linhas (DEV)"
    ON linhas_onibus FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a rotas (DEV)"
    ON rotas_atribuidas FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a configurações (DEV)"
    ON configuracoes_sistema FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- Verificar se as políticas foram criadas
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

SELECT 'Políticas RLS atualizadas para permitir acesso público (DEV)' as resultado;

