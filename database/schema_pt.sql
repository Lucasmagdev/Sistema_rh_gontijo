-- ============================================
-- SCHEMA DO SISTEMA DE RH E ROTEIRIZAÇÃO
-- Supabase PostgreSQL - Versão em Português
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto (trigram)

-- ============================================
-- TABELA: colaboradores
-- ============================================
CREATE TABLE IF NOT EXISTS colaboradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    documento VARCHAR(20) NOT NULL UNIQUE, -- CPF/CNPJ
    cargo VARCHAR(100) NOT NULL,
    departamento VARCHAR(100),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para colaboradores
CREATE INDEX IF NOT EXISTS idx_colaboradores_email ON colaboradores(email);
CREATE INDEX IF NOT EXISTS idx_colaboradores_documento ON colaboradores(documento);
CREATE INDEX IF NOT EXISTS idx_colaboradores_nome ON colaboradores USING gin(nome gin_trgm_ops); -- Busca por nome
CREATE INDEX IF NOT EXISTS idx_colaboradores_departamento ON colaboradores(departamento);
CREATE INDEX IF NOT EXISTS idx_colaboradores_cargo ON colaboradores(cargo);

-- ============================================
-- TABELA: enderecos (Endereços dos Colaboradores)
-- ============================================
CREATE TABLE IF NOT EXISTS enderecos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL DEFAULT 'MG',
    cep VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8), -- Latitude
    longitude DECIMAL(11, 8), -- Longitude
    principal BOOLEAN NOT NULL DEFAULT false,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para enderecos
CREATE INDEX IF NOT EXISTS idx_enderecos_colaborador_id ON enderecos(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_enderecos_cidade ON enderecos(cidade);
CREATE INDEX IF NOT EXISTS idx_enderecos_localizacao ON enderecos(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Índice único parcial: garante que cada colaborador tenha apenas um endereço principal
CREATE UNIQUE INDEX IF NOT EXISTS idx_enderecos_um_principal_por_colaborador 
    ON enderecos(colaborador_id) 
    WHERE principal = true;

-- ============================================
-- TABELA: cartoes_onibus (Cartões de Ônibus)
-- ============================================
CREATE TABLE IF NOT EXISTS cartoes_onibus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    numero_cartao VARCHAR(50) NOT NULL,
    tipo_cartao VARCHAR(50), -- Ex: "Bilhete Único", "Vale Transporte", etc.
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cartoes_onibus
CREATE INDEX IF NOT EXISTS idx_cartoes_colaborador_id ON cartoes_onibus(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_numero_cartao ON cartoes_onibus(numero_cartao);
CREATE INDEX IF NOT EXISTS idx_cartoes_ativo ON cartoes_onibus(colaborador_id, ativo) WHERE ativo = true;

-- ============================================
-- TABELA: localizacoes (Localizações de Referência)
-- ============================================
CREATE TABLE IF NOT EXISTS localizacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para localizacoes
CREATE INDEX IF NOT EXISTS idx_localizacoes_nome ON localizacoes USING gin(nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_localizacoes_cidade ON localizacoes(cidade);
CREATE INDEX IF NOT EXISTS idx_localizacoes_coordenadas ON localizacoes(latitude, longitude);

-- ============================================
-- TABELA: linhas_onibus (Linhas de Ônibus - GTFS)
-- ============================================
CREATE TABLE IF NOT EXISTS linhas_onibus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero VARCHAR(10) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('urbano', 'metropolitano')),
    rota_id VARCHAR(50), -- ID do GTFS
    direcao_id INTEGER,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(numero, rota_id, direcao_id)
);

-- Índices para linhas_onibus
CREATE INDEX IF NOT EXISTS idx_linhas_numero ON linhas_onibus(numero);
CREATE INDEX IF NOT EXISTS idx_linhas_tipo ON linhas_onibus(tipo);
CREATE INDEX IF NOT EXISTS idx_linhas_rota_id ON linhas_onibus(rota_id);

-- ============================================
-- TABELA: rotas_atribuidas (Rotas Atribuídas aos Colaboradores)
-- ============================================
CREATE TABLE IF NOT EXISTS rotas_atribuidas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo_rota VARCHAR(20) NOT NULL CHECK (tipo_rota IN ('ida_trabalho', 'volta_trabalho')),
    dados_rota JSONB NOT NULL, -- Dados completos da rota (Route interface)
    dados_origem JSONB NOT NULL, -- Dados da origem (Location interface)
    dados_destino JSONB NOT NULL, -- Dados do destino (Location interface)
    atribuida_em TIMESTAMP WITH TIME ZONE NOT NULL,
    ativa BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(colaborador_id, tipo_rota) -- Um colaborador pode ter apenas uma rota ativa de cada tipo
);

-- Índices para rotas_atribuidas
CREATE INDEX IF NOT EXISTS idx_rotas_colaborador_id ON rotas_atribuidas(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_rotas_tipo_rota ON rotas_atribuidas(colaborador_id, tipo_rota);
CREATE INDEX IF NOT EXISTS idx_rotas_ativa ON rotas_atribuidas(colaborador_id, ativa) WHERE ativa = true;
CREATE INDEX IF NOT EXISTS idx_rotas_dados_rota ON rotas_atribuidas USING gin(dados_rota jsonb_path_ops);

-- ============================================
-- TABELA: configuracoes_sistema (Configurações do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes_sistema (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID, -- Opcional: para configurações por usuário
    dados_configuracao JSONB NOT NULL, -- Dados completos das configurações (SystemSettings interface)
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id) -- Uma configuração por usuário (NULL = configuração global)
);

-- Índices para configuracoes_sistema
CREATE INDEX IF NOT EXISTS idx_configuracoes_usuario_id ON configuracoes_sistema(usuario_id);

-- ============================================
-- TRIGGERS: Atualização automática de atualizado_em
-- ============================================

-- Função para atualizar atualizado_em
CREATE OR REPLACE FUNCTION atualizar_data_atualizacao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para validar limite de 2 cartões por colaborador
CREATE OR REPLACE FUNCTION validar_maximo_dois_cartoes()
RETURNS TRIGGER AS $$
DECLARE
    quantidade_cartoes INTEGER;
BEGIN
    -- Contar cartões do colaborador (excluindo o registro atual em caso de UPDATE)
    IF TG_OP = 'UPDATE' THEN
        SELECT COUNT(*) INTO quantidade_cartoes 
        FROM cartoes_onibus 
        WHERE colaborador_id = NEW.colaborador_id AND id != NEW.id;
    ELSE
        SELECT COUNT(*) INTO quantidade_cartoes 
        FROM cartoes_onibus 
        WHERE colaborador_id = NEW.colaborador_id;
    END IF;
    
    -- Se já tem 2 ou mais, não permite inserir/atualizar
    IF quantidade_cartoes >= 2 THEN
        RAISE EXCEPTION 'Um colaborador pode ter no máximo 2 cartões de ônibus';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER atualizar_colaboradores_data
    BEFORE UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_enderecos_data
    BEFORE UPDATE ON enderecos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_cartoes_data
    BEFORE UPDATE ON cartoes_onibus
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_localizacoes_data
    BEFORE UPDATE ON localizacoes
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_linhas_data
    BEFORE UPDATE ON linhas_onibus
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_rotas_data
    BEFORE UPDATE ON rotas_atribuidas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_configuracoes_data
    BEFORE UPDATE ON configuracoes_sistema
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- Trigger para validar limite de cartões
CREATE TRIGGER validar_limite_cartoes
    BEFORE INSERT OR UPDATE ON cartoes_onibus
    FOR EACH ROW
    EXECUTE FUNCTION validar_maximo_dois_cartoes();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE colaboradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoes_onibus ENABLE ROW LEVEL SECURITY;
ALTER TABLE localizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE linhas_onibus ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas_atribuidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: Permitir tudo para usuários autenticados
-- (Ajuste conforme sua necessidade de segurança)

-- Política para colaboradores
CREATE POLICY "Usuários autenticados podem ver todos os colaboradores"
    ON colaboradores FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem inserir colaboradores"
    ON colaboradores FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar colaboradores"
    ON colaboradores FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem deletar colaboradores"
    ON colaboradores FOR DELETE
    TO authenticated
    USING (true);

-- Política para enderecos
CREATE POLICY "Usuários autenticados podem gerenciar endereços"
    ON enderecos FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para cartoes_onibus
CREATE POLICY "Usuários autenticados podem gerenciar cartões"
    ON cartoes_onibus FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para localizacoes
CREATE POLICY "Usuários autenticados podem gerenciar localizações"
    ON localizacoes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para linhas_onibus
CREATE POLICY "Usuários autenticados podem gerenciar linhas"
    ON linhas_onibus FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para rotas_atribuidas
CREATE POLICY "Usuários autenticados podem gerenciar rotas atribuídas"
    ON rotas_atribuidas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para configuracoes_sistema
CREATE POLICY "Usuários autenticados podem gerenciar configurações"
    ON configuracoes_sistema FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Colaboradores com endereços principais
CREATE OR REPLACE VIEW colaboradores_com_endereco_principal AS
SELECT 
    c.*,
    e.id as endereco_id,
    e.rua,
    e.numero,
    e.complemento,
    e.bairro,
    e.cidade,
    e.estado,
    e.cep,
    e.latitude,
    e.longitude
FROM colaboradores c
LEFT JOIN enderecos e ON c.id = e.colaborador_id AND e.principal = true;

-- View: Colaboradores com rotas ativas
CREATE OR REPLACE VIEW colaboradores_com_rotas AS
SELECT 
    c.id,
    c.nome,
    c.email,
    c.cargo,
    c.departamento,
    ra_ida.id as rota_ida_id,
    ra_ida.dados_rota as rota_ida_dados,
    ra_ida.ativa as rota_ida_ativa,
    ra_volta.id as rota_volta_id,
    ra_volta.dados_rota as rota_volta_dados,
    ra_volta.ativa as rota_volta_ativa
FROM colaboradores c
LEFT JOIN rotas_atribuidas ra_ida ON c.id = ra_ida.colaborador_id AND ra_ida.tipo_rota = 'ida_trabalho' AND ra_ida.ativa = true
LEFT JOIN rotas_atribuidas ra_volta ON c.id = ra_volta.colaborador_id AND ra_volta.tipo_rota = 'volta_trabalho' AND ra_volta.ativa = true;

-- View: Estatísticas de colaboradores
CREATE OR REPLACE VIEW estatisticas_colaboradores AS
SELECT 
    COUNT(DISTINCT c.id) as total_colaboradores,
    COUNT(DISTINCT e.id) as total_enderecos,
    COUNT(DISTINCT co.id) as total_cartoes,
    COUNT(DISTINCT ra.id) as total_rotas_atribuidas,
    COUNT(DISTINCT CASE WHEN ra.ativa THEN ra.id END) as rotas_ativas
FROM colaboradores c
LEFT JOIN enderecos e ON c.id = e.colaborador_id
LEFT JOIN cartoes_onibus co ON c.id = co.colaborador_id
LEFT JOIN rotas_atribuidas ra ON c.id = ra.colaborador_id;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função: Buscar colaborador com todos os dados relacionados
CREATE OR REPLACE FUNCTION obter_dados_completos_colaborador(colaborador_uuid UUID)
RETURNS JSON AS $$
DECLARE
    resultado JSON;
BEGIN
    SELECT json_build_object(
        'id', c.id,
        'name', c.nome,
        'email', c.email,
        'phone', c.telefone,
        'document', c.documento,
        'position', c.cargo,
        'department', c.departamento,
        'addresses', (
            SELECT json_agg(
                json_build_object(
                    'id', e.id,
                    'street', e.rua,
                    'number', e.numero,
                    'complement', e.complemento,
                    'neighborhood', e.bairro,
                    'city', e.cidade,
                    'state', e.estado,
                    'zipCode', e.cep,
                    'lat', e.latitude,
                    'lng', e.longitude,
                    'isMain', e.principal
                )
            )
            FROM enderecos e
            WHERE e.colaborador_id = c.id
        ),
        'busCards', (
            SELECT json_agg(
                json_build_object(
                    'id', co.id,
                    'cardNumber', co.numero_cartao,
                    'cardType', co.tipo_cartao,
                    'isActive', co.ativo
                )
            )
            FROM cartoes_onibus co
            WHERE co.colaborador_id = c.id
        ),
        'routeToWork', (
            SELECT json_build_object(
                'id', ra.id,
                'route', ra.dados_rota,
                'origin', ra.dados_origem,
                'destination', ra.dados_destino,
                'assignedAt', ra.atribuida_em,
                'isActive', ra.ativa
            )
            FROM rotas_atribuidas ra
            WHERE ra.colaborador_id = c.id AND ra.tipo_rota = 'ida_trabalho' AND ra.ativa = true
            LIMIT 1
        ),
        'routeFromWork', (
            SELECT json_build_object(
                'id', ra.id,
                'route', ra.dados_rota,
                'origin', ra.dados_origem,
                'destination', ra.dados_destino,
                'assignedAt', ra.atribuida_em,
                'isActive', ra.ativa
            )
            FROM rotas_atribuidas ra
            WHERE ra.colaborador_id = c.id AND ra.tipo_rota = 'volta_trabalho' AND ra.ativa = true
            LIMIT 1
        ),
        'createdAt', c.criado_em,
        'updatedAt', c.atualizado_em
    ) INTO resultado
    FROM colaboradores c
    WHERE c.id = colaborador_uuid;
    
    RETURN resultado;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE colaboradores IS 'Tabela principal de colaboradores do sistema';
COMMENT ON TABLE enderecos IS 'Endereços dos colaboradores (múltiplos por colaborador)';
COMMENT ON TABLE cartoes_onibus IS 'Cartões de ônibus dos colaboradores (máximo 2 por colaborador)';
COMMENT ON TABLE localizacoes IS 'Localizações de referência para roteirização';
COMMENT ON TABLE linhas_onibus IS 'Linhas de ônibus do sistema GTFS';
COMMENT ON TABLE rotas_atribuidas IS 'Rotas atribuídas aos colaboradores (ida e volta)';
COMMENT ON TABLE configuracoes_sistema IS 'Configurações do sistema';

-- ============================================
-- FIM DO SCHEMA
-- ============================================

