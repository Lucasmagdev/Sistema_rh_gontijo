-- ============================================
-- SCRIPT DE POPULAÇÃO DO BANCO DE DADOS
-- Insere 10 colaboradores com dados de exemplo
-- ============================================

-- Limpar dados existentes (opcional - descomente se quiser limpar antes)
-- TRUNCATE TABLE assigned_routes CASCADE;
-- TRUNCATE TABLE bus_cards CASCADE;
-- TRUNCATE TABLE addresses CASCADE;
-- TRUNCATE TABLE employees CASCADE;

-- ============================================
-- INSERIR COLABORADORES
-- ============================================

INSERT INTO employees (id, name, email, phone, document, position, department) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao.silva@empresa.com', '(31) 98765-4321', '123.456.789-00', 'Desenvolvedor', 'TI'),
('550e8400-e29b-41d4-a716-446655440002', 'Maria Santos', 'maria.santos@empresa.com', '(31) 98765-4322', '234.567.890-11', 'Analista de RH', 'Recursos Humanos'),
('550e8400-e29b-41d4-a716-446655440003', 'Pedro Oliveira', 'pedro.oliveira@empresa.com', '(31) 98765-4323', '345.678.901-22', 'Gerente de Projetos', 'Gestão'),
('550e8400-e29b-41d4-a716-446655440004', 'Ana Costa', 'ana.costa@empresa.com', '(31) 98765-4324', '456.789.012-33', 'Designer', 'Marketing'),
('550e8400-e29b-41d4-a716-446655440005', 'Carlos Ferreira', 'carlos.ferreira@empresa.com', '(31) 98765-4325', '567.890.123-44', 'Contador', 'Financeiro'),
('550e8400-e29b-41d4-a716-446655440006', 'Juliana Alves', 'juliana.alves@empresa.com', '(31) 98765-4326', '678.901.234-55', 'Vendedora', 'Vendas'),
('550e8400-e29b-41d4-a716-446655440007', 'Roberto Lima', 'roberto.lima@empresa.com', '(31) 98765-4327', '789.012.345-66', 'Engenheiro', 'Engenharia'),
('550e8400-e29b-41d4-a716-446655440008', 'Fernanda Rocha', 'fernanda.rocha@empresa.com', '(31) 98765-4328', '890.123.456-77', 'Advogada', 'Jurídico'),
('550e8400-e29b-41d4-a716-446655440009', 'Lucas Martins', 'lucas.martins@empresa.com', '(31) 98765-4329', '901.234.567-88', 'Analista de Dados', 'TI'),
('550e8400-e29b-41d4-a716-446655440010', 'Patrícia Gomes', 'patricia.gomes@empresa.com', '(31) 98765-4330', '012.345.678-99', 'Coordenadora', 'Operações')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR ENDEREÇOS DOS COLABORADORES
-- ============================================

INSERT INTO addresses (id, employee_id, street, number, complement, neighborhood, city, state, zip_code, lat, lng, is_main) VALUES
-- João Silva - Savassi
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Rua da Bahia', '1200', 'Apto 301', 'Centro', 'Belo Horizonte', 'MG', '30160-012', -19.9167, -43.9345, true),

-- Maria Santos - Pampulha
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Avenida Antônio Carlos', '6627', NULL, 'Pampulha', 'Belo Horizonte', 'MG', '31270-901', -19.8569, -43.9692, true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Rua dos Carijós', '500', 'Casa', 'Centro', 'Belo Horizonte', 'MG', '30120-060', -19.9200, -43.9378, false),

-- Pedro Oliveira - Barreiro
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', 'Rua Padre Pedro Pinto', '2000', 'Bloco A', 'Barreiro', 'Belo Horizonte', 'MG', '30640-000', -19.9667, -44.0167, true),

-- Ana Costa - Venda Nova
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', 'Avenida Vilarinho', '5000', 'Apto 502', 'Venda Nova', 'Belo Horizonte', 'MG', '31610-000', -19.8167, -43.9500, true),

-- Carlos Ferreira - Contagem
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', 'Rua Maria da Conceição', '150', NULL, 'Eldorado', 'Contagem', 'MG', '32315-000', -19.9333, -44.0500, true),

-- Juliana Alves - Betim
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440006', 'Avenida Juscelino Kubitschek', '300', 'Casa 2', 'Centro', 'Betim', 'MG', '32600-000', -19.9667, -44.2000, true),

-- Roberto Lima - Nova Lima
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440007', 'Rua São Paulo', '800', 'Apto 201', 'Centro', 'Nova Lima', 'MG', '34000-000', -19.9833, -43.8500, true),

-- Fernanda Rocha - Santa Luzia
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440008', 'Avenida Getúlio Vargas', '1200', NULL, 'Centro', 'Santa Luzia', 'MG', '33000-000', -19.7667, -43.8500, true),

-- Lucas Martins - São Gabriel
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440009', 'Rua dos Inconfidentes', '2500', 'Bloco B Apto 304', 'São Gabriel', 'Belo Horizonte', 'MG', '31950-000', -19.8833, -43.9833, true),

-- Patrícia Gomes - Lagoa Santa
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010', 'Rua da Igreja', '100', 'Casa', 'Centro', 'Lagoa Santa', 'MG', '33400-000', -19.6333, -43.8833, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR CARTÕES DE ÔNIBUS
-- ============================================

INSERT INTO bus_cards (id, employee_id, card_number, card_type, is_active) VALUES
-- João Silva - 1 cartão
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '1234567890123456', 'Bilhete Único', true),

-- Maria Santos - 2 cartões
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2345678901234567', 'Bilhete Único', true),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '3456789012345678', 'Vale Transporte', true),

-- Pedro Oliveira - 1 cartão
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '4567890123456789', 'Bilhete Único', true),

-- Ana Costa - 2 cartões
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440004', '5678901234567890', 'Bilhete Único', true),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440004', '6789012345678901', 'Bilhete Único', false),

-- Carlos Ferreira - 1 cartão
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '7890123456789012', 'Vale Transporte', true),

-- Juliana Alves - 1 cartão
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440006', '8901234567890123', 'Bilhete Único', true),

-- Roberto Lima - 2 cartões
('770e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440007', '9012345678901234', 'Bilhete Único', true),
('770e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440007', '0123456789012345', 'Vale Transporte', true),

-- Fernanda Rocha - 1 cartão
('770e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440008', '1234509876543210', 'Bilhete Único', true),

-- Lucas Martins - 1 cartão
('770e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440009', '2345610987654321', 'Bilhete Único', true),

-- Patrícia Gomes - 1 cartão
('770e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440010', '3456721098765432', 'Vale Transporte', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR LOCALIZAÇÕES DE REFERÊNCIA
-- ============================================

INSERT INTO locations (id, name, city, lat, lng) VALUES
('880e8400-e29b-41d4-a716-446655440001', 'Praça Sete', 'Belo Horizonte', -19.9167, -43.9345),
('880e8400-e29b-41d4-a716-446655440002', 'Savassi', 'Belo Horizonte', -19.9333, -43.9333),
('880e8400-e29b-41d4-a716-446655440003', 'Pampulha', 'Belo Horizonte', -19.8569, -43.9692),
('880e8400-e29b-41d4-a716-446655440004', 'Barreiro', 'Belo Horizonte', -19.9667, -44.0167),
('880e8400-e29b-41d4-a716-446655440005', 'Venda Nova', 'Belo Horizonte', -19.8167, -43.9500),
('880e8400-e29b-41d4-a716-446655440006', 'São Gabriel', 'Belo Horizonte', -19.8833, -43.9833),
('880e8400-e29b-41d4-a716-446655440007', 'Vilarinho', 'Belo Horizonte', -19.8500, -43.9500),
('880e8400-e29b-41d4-a716-446655440008', 'Centro', 'Belo Horizonte', -19.9200, -43.9378),
('880e8400-e29b-41d4-a716-446655440009', 'Contagem', 'Contagem', -19.9333, -44.0500),
('880e8400-e29b-41d4-a716-446655440010', 'Betim', 'Betim', -19.9667, -44.2000)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR LINHAS DE ÔNIBUS (Exemplos do GTFS)
-- ============================================

INSERT INTO bus_lines (id, number, name, type, route_id, direction_id) VALUES
('990e8400-e29b-41d4-a716-446655440001', '10', 'Madrugão / Circular Noturno', 'urbano', '989341', 0),
('990e8400-e29b-41d4-a716-446655440002', '30', 'Estação Diamante/Centro', 'urbano', '562172', 0),
('990e8400-e29b-41d4-a716-446655440003', '50', 'Estação Pampulha / Centro - Direta', 'urbano', '561929', 0),
('990e8400-e29b-41d4-a716-446655440004', '51', 'Estação Pampulha / Centro / Hospitais', 'urbano', '562134', 0),
('990e8400-e29b-41d4-a716-446655440005', '61', 'Estação Venda Nova/Centro-Direta', 'urbano', '561937', 0),
('990e8400-e29b-41d4-a716-446655440006', '62', 'Estação Venda Nova/Savassi Via Hospitais', 'urbano', '561896', 0),
('990e8400-e29b-41d4-a716-446655440007', '65', 'Estação Vilarinho/Centro Via Antônio Carlos-Direta', 'urbano', '562193', 0),
('990e8400-e29b-41d4-a716-446655440008', '66', 'Estação Vilarinho/Centro/Hospitais Via Cristiano Machado (Direta)', 'urbano', '562052', 0),
('990e8400-e29b-41d4-a716-446655440009', '82', 'Estação São Gabriel / Savassi Via Hospitais', 'urbano', '561968', 0),
('990e8400-e29b-41d4-a716-446655440010', '2101', 'Belo Horizonte / Contagem', 'metropolitano', '550001', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERIR ROTAS ATRIBUÍDAS (Exemplos)
-- ============================================

-- Rota de ida para João Silva (Savassi -> Centro)
INSERT INTO assigned_routes (id, employee_id, route_type, route_data, origin_data, destination_data, assigned_at, is_active) VALUES
('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'to_work',
 '{"id":"route-001","segments":[{"busLine":{"number":"30","name":"Estação Diamante/Centro","type":"urbano"},"from":"Savassi","to":"Centro","duration":25,"distance":5.2}],"totalDuration":25,"totalDistance":5.2,"totalCost":4.50,"integrations":0,"path":[[-19.9333,-43.9333],[-19.9200,-43.9378]],"badges":["rapido"]}',
 '{"id":"loc-001","name":"Casa - João Silva","city":"Belo Horizonte","lat":-19.9333,"lng":-43.9333}',
 '{"id":"loc-002","name":"Trabalho","city":"Belo Horizonte","lat":-19.9200,"lng":-43.9378}',
 NOW() - INTERVAL '30 days', true)
ON CONFLICT (id) DO NOTHING;

-- Rota de ida para Maria Santos (Pampulha -> Centro)
INSERT INTO assigned_routes (id, employee_id, route_type, route_data, origin_data, destination_data, assigned_at, is_active) VALUES
('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'to_work',
 '{"id":"route-002","segments":[{"busLine":{"number":"50","name":"Estação Pampulha / Centro - Direta","type":"urbano"},"from":"Pampulha","to":"Centro","duration":35,"distance":8.5}],"totalDuration":35,"totalDistance":8.5,"totalCost":4.50,"integrations":0,"path":[[-19.8569,-43.9692],[-19.9200,-43.9378]],"badges":["equilibrado"]}',
 '{"id":"loc-003","name":"Casa - Maria Santos","city":"Belo Horizonte","lat":-19.8569,"lng":-43.9692}',
 '{"id":"loc-002","name":"Trabalho","city":"Belo Horizonte","lat":-19.9200,"lng":-43.9378}',
 NOW() - INTERVAL '15 days', true)
ON CONFLICT (id) DO NOTHING;

-- Rota de volta para Maria Santos (Centro -> Pampulha)
INSERT INTO assigned_routes (id, employee_id, route_type, route_data, origin_data, destination_data, assigned_at, is_active) VALUES
('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'from_work',
 '{"id":"route-003","segments":[{"busLine":{"number":"51","name":"Estação Pampulha / Centro / Hospitais","type":"urbano"},"from":"Centro","to":"Pampulha","duration":40,"distance":8.5}],"totalDuration":40,"totalDistance":8.5,"totalCost":4.50,"integrations":0,"path":[[-19.9200,-43.9378],[-19.8569,-43.9692]],"badges":["equilibrado"]}',
 '{"id":"loc-002","name":"Trabalho","city":"Belo Horizonte","lat":-19.9200,"lng":-43.9378}',
 '{"id":"loc-003","name":"Casa - Maria Santos","city":"Belo Horizonte","lat":-19.8569,"lng":-43.9692}',
 NOW() - INTERVAL '15 days', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- ============================================

-- Contar registros inseridos
SELECT 
    'employees' as tabela, COUNT(*) as total FROM employees
UNION ALL
SELECT 'addresses', COUNT(*) FROM addresses
UNION ALL
SELECT 'bus_cards', COUNT(*) FROM bus_cards
UNION ALL
SELECT 'locations', COUNT(*) FROM locations
UNION ALL
SELECT 'bus_lines', COUNT(*) FROM bus_lines
UNION ALL
SELECT 'assigned_routes', COUNT(*) FROM assigned_routes;

-- ============================================
-- FIM DO SCRIPT DE POPULAÇÃO
-- ============================================

