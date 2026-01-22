-- ============================================
-- SCHEMA DO SISTEMA DE RH E ROTEIRIZAÇÃO
-- Supabase PostgreSQL
-- ============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca de texto (trigram)

-- ============================================
-- TABELA: employees (Colaboradores)
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    document VARCHAR(20) NOT NULL UNIQUE, -- CPF/CNPJ
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para employees
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_document ON employees(document);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees USING gin(name gin_trgm_ops); -- Busca por nome
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);

-- ============================================
-- TABELA: addresses (Endereços dos Colaboradores)
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    street VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(100),
    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL DEFAULT 'MG',
    zip_code VARCHAR(10) NOT NULL,
    lat DECIMAL(10, 8), -- Latitude
    lng DECIMAL(11, 8), -- Longitude
    is_main BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para addresses
CREATE INDEX IF NOT EXISTS idx_addresses_employee_id ON addresses(employee_id);
CREATE INDEX IF NOT EXISTS idx_addresses_city ON addresses(city);
CREATE INDEX IF NOT EXISTS idx_addresses_location ON addresses(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Índice único parcial: garante que cada employee tenha apenas um endereço principal
CREATE UNIQUE INDEX IF NOT EXISTS idx_addresses_one_main_per_employee 
    ON addresses(employee_id) 
    WHERE is_main = true;

-- ============================================
-- TABELA: bus_cards (Cartões de Ônibus)
-- ============================================
CREATE TABLE IF NOT EXISTS bus_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    card_number VARCHAR(50) NOT NULL,
    card_type VARCHAR(50), -- Ex: "Bilhete Único", "Vale Transporte", etc.
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para bus_cards
CREATE INDEX IF NOT EXISTS idx_bus_cards_employee_id ON bus_cards(employee_id);
CREATE INDEX IF NOT EXISTS idx_bus_cards_card_number ON bus_cards(card_number);
CREATE INDEX IF NOT EXISTS idx_bus_cards_is_active ON bus_cards(employee_id, is_active) WHERE is_active = true;

-- ============================================
-- TABELA: locations (Localizações de Referência)
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para locations
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_locations_city ON locations(city);
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations(lat, lng);

-- ============================================
-- TABELA: bus_lines (Linhas de Ônibus - GTFS)
-- ============================================
CREATE TABLE IF NOT EXISTS bus_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('urbano', 'metropolitano')),
    route_id VARCHAR(50), -- ID do GTFS
    direction_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(number, route_id, direction_id)
);

-- Índices para bus_lines
CREATE INDEX IF NOT EXISTS idx_bus_lines_number ON bus_lines(number);
CREATE INDEX IF NOT EXISTS idx_bus_lines_type ON bus_lines(type);
CREATE INDEX IF NOT EXISTS idx_bus_lines_route_id ON bus_lines(route_id);

-- ============================================
-- TABELA: assigned_routes (Rotas Atribuídas aos Colaboradores)
-- ============================================
CREATE TABLE IF NOT EXISTS assigned_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    route_type VARCHAR(20) NOT NULL CHECK (route_type IN ('to_work', 'from_work')),
    route_data JSONB NOT NULL, -- Dados completos da rota (Route interface)
    origin_data JSONB NOT NULL, -- Dados da origem (Location interface)
    destination_data JSONB NOT NULL, -- Dados do destino (Location interface)
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, route_type) -- Um colaborador pode ter apenas uma rota ativa de cada tipo
);

-- Índices para assigned_routes
CREATE INDEX IF NOT EXISTS idx_assigned_routes_employee_id ON assigned_routes(employee_id);
CREATE INDEX IF NOT EXISTS idx_assigned_routes_route_type ON assigned_routes(employee_id, route_type);
CREATE INDEX IF NOT EXISTS idx_assigned_routes_is_active ON assigned_routes(employee_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_assigned_routes_route_data ON assigned_routes USING gin(route_data jsonb_path_ops);

-- ============================================
-- TABELA: system_settings (Configurações do Sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Opcional: para configurações por usuário
    settings_data JSONB NOT NULL, -- Dados completos das configurações (SystemSettings interface)
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- Uma configuração por usuário (NULL = configuração global)
);

-- Índices para system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_user_id ON system_settings(user_id);

-- ============================================
-- TRIGGERS: Atualização automática de updated_at
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para validar limite de 2 cartões por colaborador
CREATE OR REPLACE FUNCTION check_max_two_cards()
RETURNS TRIGGER AS $$
DECLARE
    card_count INTEGER;
BEGIN
    -- Contar cartões do colaborador (excluindo o registro atual em caso de UPDATE)
    IF TG_OP = 'UPDATE' THEN
        SELECT COUNT(*) INTO card_count 
        FROM bus_cards 
        WHERE employee_id = NEW.employee_id AND id != NEW.id;
    ELSE
        SELECT COUNT(*) INTO card_count 
        FROM bus_cards 
        WHERE employee_id = NEW.employee_id;
    END IF;
    
    -- Se já tem 2 ou mais, não permite inserir/atualizar
    IF card_count >= 2 THEN
        RAISE EXCEPTION 'Um colaborador pode ter no máximo 2 cartões de ônibus';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bus_cards_updated_at
    BEFORE UPDATE ON bus_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bus_lines_updated_at
    BEFORE UPDATE ON bus_lines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assigned_routes_updated_at
    BEFORE UPDATE ON assigned_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para validar limite de cartões
CREATE TRIGGER check_bus_cards_limit
    BEFORE INSERT OR UPDATE ON bus_cards
    FOR EACH ROW
    EXECUTE FUNCTION check_max_two_cards();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE assigned_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas básicas: Permitir tudo para usuários autenticados
-- (Ajuste conforme sua necessidade de segurança)

-- Política para employees
CREATE POLICY "Usuários autenticados podem ver todos os colaboradores"
    ON employees FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem inserir colaboradores"
    ON employees FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar colaboradores"
    ON employees FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuários autenticados podem deletar colaboradores"
    ON employees FOR DELETE
    TO authenticated
    USING (true);

-- Política para addresses
CREATE POLICY "Usuários autenticados podem gerenciar endereços"
    ON addresses FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para bus_cards
CREATE POLICY "Usuários autenticados podem gerenciar cartões"
    ON bus_cards FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para locations
CREATE POLICY "Usuários autenticados podem gerenciar localizações"
    ON locations FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para bus_lines
CREATE POLICY "Usuários autenticados podem gerenciar linhas"
    ON bus_lines FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para assigned_routes
CREATE POLICY "Usuários autenticados podem gerenciar rotas atribuídas"
    ON assigned_routes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para system_settings
CREATE POLICY "Usuários autenticados podem gerenciar configurações"
    ON system_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View: Colaboradores com endereços principais
CREATE OR REPLACE VIEW employees_with_main_address AS
SELECT 
    e.*,
    a.id as address_id,
    a.street,
    a.number,
    a.complement,
    a.neighborhood,
    a.city,
    a.state,
    a.zip_code,
    a.lat,
    a.lng
FROM employees e
LEFT JOIN addresses a ON e.id = a.employee_id AND a.is_main = true;

-- View: Colaboradores com rotas ativas
CREATE OR REPLACE VIEW employees_with_routes AS
SELECT 
    e.id,
    e.name,
    e.email,
    e.position,
    e.department,
    ar_to.id as route_to_work_id,
    ar_to.route_data as route_to_work_data,
    ar_to.is_active as route_to_work_active,
    ar_from.id as route_from_work_id,
    ar_from.route_data as route_from_work_data,
    ar_from.is_active as route_from_work_active
FROM employees e
LEFT JOIN assigned_routes ar_to ON e.id = ar_to.employee_id AND ar_to.route_type = 'to_work' AND ar_to.is_active = true
LEFT JOIN assigned_routes ar_from ON e.id = ar_from.employee_id AND ar_from.route_type = 'from_work' AND ar_from.is_active = true;

-- View: Estatísticas de colaboradores
CREATE OR REPLACE VIEW employee_stats AS
SELECT 
    COUNT(DISTINCT e.id) as total_employees,
    COUNT(DISTINCT a.id) as total_addresses,
    COUNT(DISTINCT bc.id) as total_bus_cards,
    COUNT(DISTINCT ar.id) as total_assigned_routes,
    COUNT(DISTINCT CASE WHEN ar.is_active THEN ar.id END) as active_routes
FROM employees e
LEFT JOIN addresses a ON e.id = a.employee_id
LEFT JOIN bus_cards bc ON e.id = bc.employee_id
LEFT JOIN assigned_routes ar ON e.id = ar.employee_id;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função: Buscar colaborador com todos os dados relacionados
CREATE OR REPLACE FUNCTION get_employee_full_data(employee_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', e.id,
        'name', e.name,
        'email', e.email,
        'phone', e.phone,
        'document', e.document,
        'position', e.position,
        'department', e.department,
        'addresses', (
            SELECT json_agg(
                json_build_object(
                    'id', a.id,
                    'street', a.street,
                    'number', a.number,
                    'complement', a.complement,
                    'neighborhood', a.neighborhood,
                    'city', a.city,
                    'state', a.state,
                    'zipCode', a.zip_code,
                    'lat', a.lat,
                    'lng', a.lng,
                    'isMain', a.is_main
                )
            )
            FROM addresses a
            WHERE a.employee_id = e.id
        ),
        'busCards', (
            SELECT json_agg(
                json_build_object(
                    'id', bc.id,
                    'cardNumber', bc.card_number,
                    'cardType', bc.card_type,
                    'isActive', bc.is_active
                )
            )
            FROM bus_cards bc
            WHERE bc.employee_id = e.id
        ),
        'routeToWork', (
            SELECT json_build_object(
                'id', ar.id,
                'route', ar.route_data,
                'origin', ar.origin_data,
                'destination', ar.destination_data,
                'assignedAt', ar.assigned_at,
                'isActive', ar.is_active
            )
            FROM assigned_routes ar
            WHERE ar.employee_id = e.id AND ar.route_type = 'to_work' AND ar.is_active = true
            LIMIT 1
        ),
        'routeFromWork', (
            SELECT json_build_object(
                'id', ar.id,
                'route', ar.route_data,
                'origin', ar.origin_data,
                'destination', ar.destination_data,
                'assignedAt', ar.assigned_at,
                'isActive', ar.is_active
            )
            FROM assigned_routes ar
            WHERE ar.employee_id = e.id AND ar.route_type = 'from_work' AND ar.is_active = true
            LIMIT 1
        ),
        'createdAt', e.created_at,
        'updatedAt', e.updated_at
    ) INTO result
    FROM employees e
    WHERE e.id = employee_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================

COMMENT ON TABLE employees IS 'Tabela principal de colaboradores do sistema';
COMMENT ON TABLE addresses IS 'Endereços dos colaboradores (múltiplos por colaborador)';
COMMENT ON TABLE bus_cards IS 'Cartões de ônibus dos colaboradores (máximo 2 por colaborador)';
COMMENT ON TABLE locations IS 'Localizações de referência para roteirização';
COMMENT ON TABLE bus_lines IS 'Linhas de ônibus do sistema GTFS';
COMMENT ON TABLE assigned_routes IS 'Rotas atribuídas aos colaboradores (ida e volta)';
COMMENT ON TABLE system_settings IS 'Configurações do sistema';

-- ============================================
-- FIM DO SCHEMA
-- ============================================

