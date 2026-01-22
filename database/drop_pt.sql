-- ============================================
-- SCRIPT DE EXCLUSÃO DO BANCO DE DADOS (PORTUGUÊS)
-- Remove todas as tabelas, funções, triggers e políticas
-- ATENÇÃO: Este script apaga TODOS os dados!
-- ============================================

-- Desabilitar RLS temporariamente para facilitar exclusão
ALTER TABLE IF EXISTS colaboradores DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enderecos DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cartoes_onibus DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS localizacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS linhas_onibus DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rotas_atribuidas DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS configuracoes_sistema DISABLE ROW LEVEL SECURITY;

-- Remover políticas RLS
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

-- Remover triggers
DROP TRIGGER IF EXISTS atualizar_colaboradores_data ON colaboradores;
DROP TRIGGER IF EXISTS atualizar_enderecos_data ON enderecos;
DROP TRIGGER IF EXISTS atualizar_cartoes_data ON cartoes_onibus;
DROP TRIGGER IF EXISTS atualizar_localizacoes_data ON localizacoes;
DROP TRIGGER IF EXISTS atualizar_linhas_data ON linhas_onibus;
DROP TRIGGER IF EXISTS atualizar_rotas_data ON rotas_atribuidas;
DROP TRIGGER IF EXISTS atualizar_configuracoes_data ON configuracoes_sistema;
DROP TRIGGER IF EXISTS validar_limite_cartoes ON cartoes_onibus;

-- Remover views
DROP VIEW IF EXISTS colaboradores_com_endereco_principal;
DROP VIEW IF EXISTS colaboradores_com_rotas;
DROP VIEW IF EXISTS estatisticas_colaboradores;

-- Remover funções
DROP FUNCTION IF EXISTS atualizar_data_atualizacao();
DROP FUNCTION IF EXISTS validar_maximo_dois_cartoes();
DROP FUNCTION IF EXISTS obter_dados_completos_colaborador(UUID);

-- Remover tabelas (em ordem para respeitar foreign keys)
DROP TABLE IF EXISTS rotas_atribuidas CASCADE;
DROP TABLE IF EXISTS cartoes_onibus CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;
DROP TABLE IF EXISTS colaboradores CASCADE;
DROP TABLE IF EXISTS localizacoes CASCADE;
DROP TABLE IF EXISTS linhas_onibus CASCADE;
DROP TABLE IF EXISTS configuracoes_sistema CASCADE;

-- Remover índices (caso ainda existam)
DROP INDEX IF EXISTS idx_colaboradores_email;
DROP INDEX IF EXISTS idx_colaboradores_documento;
DROP INDEX IF EXISTS idx_colaboradores_nome;
DROP INDEX IF EXISTS idx_colaboradores_departamento;
DROP INDEX IF EXISTS idx_colaboradores_cargo;
DROP INDEX IF EXISTS idx_enderecos_colaborador_id;
DROP INDEX IF EXISTS idx_enderecos_cidade;
DROP INDEX IF EXISTS idx_enderecos_localizacao;
DROP INDEX IF EXISTS idx_enderecos_um_principal_por_colaborador;
DROP INDEX IF EXISTS idx_cartoes_colaborador_id;
DROP INDEX IF EXISTS idx_cartoes_numero_cartao;
DROP INDEX IF EXISTS idx_cartoes_ativo;
DROP INDEX IF EXISTS idx_localizacoes_nome;
DROP INDEX IF EXISTS idx_localizacoes_cidade;
DROP INDEX IF EXISTS idx_localizacoes_coordenadas;
DROP INDEX IF EXISTS idx_linhas_numero;
DROP INDEX IF EXISTS idx_linhas_tipo;
DROP INDEX IF EXISTS idx_linhas_rota_id;
DROP INDEX IF EXISTS idx_rotas_colaborador_id;
DROP INDEX IF EXISTS idx_rotas_tipo_rota;
DROP INDEX IF EXISTS idx_rotas_ativa;
DROP INDEX IF EXISTS idx_rotas_dados_rota;
DROP INDEX IF EXISTS idx_configuracoes_usuario_id;

-- ============================================
-- FIM DO SCRIPT DE EXCLUSÃO
-- ============================================

SELECT 'Banco de dados excluído com sucesso!' as resultado;

