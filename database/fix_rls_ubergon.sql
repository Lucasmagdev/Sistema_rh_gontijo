-- ============================================
-- CORREÇÃO DE POLÍTICAS RLS PARA UBERGON
-- ============================================
-- Este arquivo corrige as políticas RLS para permitir
-- operações sem autenticação (para uso com anon key)

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários autenticados podem ver rotas de motoristas" ON rotas_motoristas;
DROP POLICY IF EXISTS "Usuários autenticados podem criar rotas de motoristas" ON rotas_motoristas;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar rotas de motoristas" ON rotas_motoristas;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar rotas de motoristas" ON rotas_motoristas;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar paradas de rotas" ON paradas_rotas;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar pontos de embarque" ON pontos_embarque;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar atribuições de rotas" ON atribuicoes_rotas_motoristas;

-- Políticas para rotas_motoristas (permitir todas as operações)
CREATE POLICY "Permitir todas operações em rotas_motoristas"
    ON rotas_motoristas FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas para paradas_rotas (permitir todas as operações)
CREATE POLICY "Permitir todas operações em paradas_rotas"
    ON paradas_rotas FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas para pontos_embarque (permitir todas as operações)
CREATE POLICY "Permitir todas operações em pontos_embarque"
    ON pontos_embarque FOR ALL
    USING (true)
    WITH CHECK (true);

-- Políticas para atribuicoes_rotas_motoristas (permitir todas as operações)
CREATE POLICY "Permitir todas operações em atribuicoes_rotas_motoristas"
    ON atribuicoes_rotas_motoristas FOR ALL
    USING (true)
    WITH CHECK (true);

