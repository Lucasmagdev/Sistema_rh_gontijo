-- ============================================
-- SCRIPT DE EXCLUSÃO DO BANCO DE DADOS
-- Remove todas as tabelas, funções, triggers e políticas
-- ATENÇÃO: Este script apaga TODOS os dados!
-- ============================================

-- Desabilitar RLS temporariamente para facilitar exclusão
ALTER TABLE IF EXISTS employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS addresses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bus_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bus_lines DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS assigned_routes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings DISABLE ROW LEVEL SECURITY;

-- Remover políticas RLS
DROP POLICY IF EXISTS "Usuários autenticados podem ver todos os colaboradores" ON employees;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir colaboradores" ON employees;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar colaboradores" ON employees;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar colaboradores" ON employees;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar endereços" ON addresses;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar cartões" ON bus_cards;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar localizações" ON locations;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar linhas" ON bus_lines;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar rotas atribuídas" ON assigned_routes;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar configurações" ON system_settings;

-- Remover triggers
DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
DROP TRIGGER IF EXISTS update_addresses_updated_at ON addresses;
DROP TRIGGER IF EXISTS update_bus_cards_updated_at ON bus_cards;
DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
DROP TRIGGER IF EXISTS update_bus_lines_updated_at ON bus_lines;
DROP TRIGGER IF EXISTS update_assigned_routes_updated_at ON assigned_routes;
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
DROP TRIGGER IF EXISTS check_bus_cards_limit ON bus_cards;

-- Remover views
DROP VIEW IF EXISTS employees_with_main_address;
DROP VIEW IF EXISTS employees_with_routes;
DROP VIEW IF EXISTS employee_stats;

-- Remover funções
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS check_max_two_cards();
DROP FUNCTION IF EXISTS get_employee_full_data(UUID);

-- Remover tabelas (em ordem para respeitar foreign keys)
DROP TABLE IF EXISTS assigned_routes CASCADE;
DROP TABLE IF EXISTS bus_cards CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS bus_lines CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Remover índices (caso ainda existam)
DROP INDEX IF EXISTS idx_employees_email;
DROP INDEX IF EXISTS idx_employees_document;
DROP INDEX IF EXISTS idx_employees_name;
DROP INDEX IF EXISTS idx_employees_department;
DROP INDEX IF EXISTS idx_employees_position;
DROP INDEX IF EXISTS idx_addresses_employee_id;
DROP INDEX IF EXISTS idx_addresses_city;
DROP INDEX IF EXISTS idx_addresses_location;
DROP INDEX IF EXISTS idx_addresses_one_main_per_employee;
DROP INDEX IF EXISTS idx_bus_cards_employee_id;
DROP INDEX IF EXISTS idx_bus_cards_card_number;
DROP INDEX IF EXISTS idx_bus_cards_is_active;
DROP INDEX IF EXISTS idx_locations_name;
DROP INDEX IF EXISTS idx_locations_city;
DROP INDEX IF EXISTS idx_locations_coordinates;
DROP INDEX IF EXISTS idx_bus_lines_number;
DROP INDEX IF EXISTS idx_bus_lines_type;
DROP INDEX IF EXISTS idx_bus_lines_route_id;
DROP INDEX IF EXISTS idx_assigned_routes_employee_id;
DROP INDEX IF EXISTS idx_assigned_routes_route_type;
DROP INDEX IF EXISTS idx_assigned_routes_is_active;
DROP INDEX IF EXISTS idx_assigned_routes_route_data;
DROP INDEX IF EXISTS idx_system_settings_user_id;

-- ============================================
-- FIM DO SCRIPT DE EXCLUSÃO
-- ============================================

SELECT 'Banco de dados excluído com sucesso!' as resultado;

