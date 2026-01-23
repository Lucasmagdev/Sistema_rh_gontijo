-- ============================================
-- SCHEMA UBERGON - Rotas de Motoristas
-- Supabase PostgreSQL - Versão em Português
-- ============================================

-- ============================================
-- TABELA: rotas_motoristas (Rotas de Motoristas/Caronas)
-- ============================================
CREATE TABLE IF NOT EXISTS rotas_motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    motorista_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    origem_dados JSONB NOT NULL, -- Dados da origem (Location interface)
    destino_dados JSONB NOT NULL, -- Dados do destino (Location interface)
    caminho JSONB NOT NULL, -- Array de coordenadas [number, number][]
    cor VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Cor hex da rota
    capacidade INTEGER NOT NULL DEFAULT 4,
    passageiros_atuais JSONB NOT NULL DEFAULT '[]'::jsonb, -- IDs dos passageiros
    ativa BOOLEAN NOT NULL DEFAULT true,
    horarios JSONB, -- { departureTime, returnTime, daysOfWeek }
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para rotas_motoristas
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_motorista_id ON rotas_motoristas(motorista_id);
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_ativa ON rotas_motoristas(ativa) WHERE ativa = true;
CREATE INDEX IF NOT EXISTS idx_rotas_motoristas_nome ON rotas_motoristas USING gin(nome gin_trgm_ops);

-- ============================================
-- TABELA: paradas_rotas (Paradas nas Rotas de Motoristas)
-- ============================================
CREATE TABLE IF NOT EXISTS paradas_rotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rota_motorista_id UUID NOT NULL REFERENCES rotas_motoristas(id) ON DELETE CASCADE,
    localizacao_dados JSONB NOT NULL, -- Dados da localização (Location interface)
    nome VARCHAR(255) NOT NULL,
    ordem INTEGER NOT NULL, -- Ordem na rota (0 = primeira parada)
    ponto_embarque_fixo BOOLEAN NOT NULL DEFAULT false,
    horario VARCHAR(5), -- Horário da parada (HH:mm)
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para paradas_rotas
CREATE INDEX IF NOT EXISTS idx_paradas_rota_id ON paradas_rotas(rota_motorista_id);
CREATE INDEX IF NOT EXISTS idx_paradas_ordem ON paradas_rotas(rota_motorista_id, ordem);

-- ============================================
-- TABELA: pontos_embarque (Pontos Fixos de Embarque)
-- ============================================
CREATE TABLE IF NOT EXISTS pontos_embarque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    localizacao_dados JSONB NOT NULL, -- Dados da localização (Location interface)
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    rotas_ids JSONB NOT NULL DEFAULT '[]'::jsonb, -- IDs das rotas que passam por este ponto
    ativo BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pontos_embarque
CREATE INDEX IF NOT EXISTS idx_pontos_embarque_ativo ON pontos_embarque(ativo) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_pontos_embarque_nome ON pontos_embarque USING gin(nome gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_pontos_embarque_rotas_ids ON pontos_embarque USING gin(rotas_ids jsonb_path_ops);

-- ============================================
-- TABELA: atribuicoes_rotas_motoristas (Atribuições de Passageiros às Rotas)
-- ============================================
CREATE TABLE IF NOT EXISTS atribuicoes_rotas_motoristas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    rota_motorista_id UUID NOT NULL REFERENCES rotas_motoristas(id) ON DELETE CASCADE,
    atribuida_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ativa BOOLEAN NOT NULL DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(colaborador_id, rota_motorista_id) -- Um colaborador pode estar em apenas uma rota
);

-- Índices para atribuicoes_rotas_motoristas
CREATE INDEX IF NOT EXISTS idx_atribuicoes_colaborador_id ON atribuicoes_rotas_motoristas(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_rota_id ON atribuicoes_rotas_motoristas(rota_motorista_id);
CREATE INDEX IF NOT EXISTS idx_atribuicoes_ativa ON atribuicoes_rotas_motoristas(ativa) WHERE ativa = true;

-- ============================================
-- TRIGGERS: Atualização automática de atualizado_em
-- ============================================

CREATE TRIGGER atualizar_rotas_motoristas_data
    BEFORE UPDATE ON rotas_motoristas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_paradas_rotas_data
    BEFORE UPDATE ON paradas_rotas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_pontos_embarque_data
    BEFORE UPDATE ON pontos_embarque
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

CREATE TRIGGER atualizar_atribuicoes_rotas_motoristas_data
    BEFORE UPDATE ON atribuicoes_rotas_motoristas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_data_atualizacao();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE rotas_motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE paradas_rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pontos_embarque ENABLE ROW LEVEL SECURITY;
ALTER TABLE atribuicoes_rotas_motoristas ENABLE ROW LEVEL SECURITY;

-- Políticas para rotas_motoristas
CREATE POLICY "Usuários autenticados podem ver rotas de motoristas"
    ON rotas_motoristas FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem criar rotas de motoristas"
    ON rotas_motoristas FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar rotas de motoristas"
    ON rotas_motoristas FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem deletar rotas de motoristas"
    ON rotas_motoristas FOR DELETE
    TO authenticated
    USING (true);

-- Políticas para paradas_rotas
CREATE POLICY "Usuários autenticados podem gerenciar paradas de rotas"
    ON paradas_rotas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para pontos_embarque
CREATE POLICY "Usuários autenticados podem gerenciar pontos de embarque"
    ON pontos_embarque FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para atribuicoes_rotas_motoristas
CREATE POLICY "Usuários autenticados podem gerenciar atribuições de rotas"
    ON atribuicoes_rotas_motoristas FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE rotas_motoristas IS 'Rotas fixas de motoristas (caronas)';
COMMENT ON TABLE paradas_rotas IS 'Paradas intermediárias nas rotas de motoristas';
COMMENT ON TABLE pontos_embarque IS 'Pontos fixos onde pessoas podem pegar carona';
COMMENT ON TABLE atribuicoes_rotas_motoristas IS 'Atribuições de colaboradores/passageiros às rotas de motoristas';

