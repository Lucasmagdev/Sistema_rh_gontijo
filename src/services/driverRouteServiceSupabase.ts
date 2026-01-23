/**
 * Serviço de Rotas de Motoristas (UberGon) usando Supabase
 * 
 * Esta é uma versão adaptada do driverRouteService.ts para usar Supabase.
 * Mantém a mesma interface pública para facilitar migração.
 * 
 * Fallback automático para localStorage se Supabase não estiver configurado.
 */

import { DriverRoute, DriverRouteFormData, DriverRouteAssignment, RouteStop, PickupPoint } from '../types/driverRoute';
import { Employee } from '../types/employee';
import { Location } from '../types/route';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getAllEmployees } from './employeeServiceSupabase';
import * as localStorageService from './driverRouteService'; // Fallback

// Re-exportar constantes e funções que não dependem de storage
export { DRIVER_ROUTE_COLORS, calculateCarRoute } from './driverRouteService';

/**
 * Converte DriverRoute do formato TypeScript para formato do banco
 */
function driverRouteToDb(route: DriverRoute | DriverRouteFormData): any {
  const routeData: any = {
    motorista_id: route.driverId,
    nome: route.name,
    origem_dados: route.origin,
    destino_dados: route.destination,
    caminho: route.path,
    cor: route.color,
    capacidade: route.capacity,
    horarios: route.schedule || null,
  };

  // Apenas adicionar id e outros campos se for DriverRoute (não FormData)
  if ('id' in route) {
    routeData.id = route.id;
    routeData.passageiros_atuais = route.currentPassengers || [];
    routeData.ativa = route.isActive !== undefined ? route.isActive : true;
  } else {
    // Para FormData, usar valores padrão
    routeData.passageiros_atuais = [];
    routeData.ativa = true;
  }

  return routeData;
}

/**
 * Converte DriverRoute do formato do banco para formato TypeScript
 */
function driverRouteFromDb(dbRoute: any, driver?: Employee): DriverRoute {
  return {
    id: dbRoute.id,
    driverId: dbRoute.motorista_id,
    driver,
    name: dbRoute.nome,
    origin: dbRoute.origem_dados as Location,
    destination: dbRoute.destino_dados as Location,
    stops: [], // Será preenchido separadamente
    path: dbRoute.caminho as [number, number][],
    color: dbRoute.cor,
    capacity: dbRoute.capacidade,
    currentPassengers: dbRoute.passageiros_atuais || [],
    isActive: dbRoute.ativa,
    schedule: dbRoute.horarios || undefined,
    createdAt: dbRoute.criado_em,
    updatedAt: dbRoute.atualizado_em,
  };
}

/**
 * Converte RouteStop do formato TypeScript para formato do banco
 */
function routeStopToDb(stop: RouteStop, routeId: string): any {
  return {
    id: stop.id,
    rota_motorista_id: routeId,
    localizacao_dados: stop.location,
    nome: stop.name,
    ordem: stop.order,
    ponto_embarque_fixo: stop.isPickupPoint,
    horario: stop.time || null,
  };
}

/**
 * Converte RouteStop do formato do banco para formato TypeScript
 */
function routeStopFromDb(dbStop: any): RouteStop {
  return {
    id: dbStop.id,
    location: dbStop.localizacao_dados as Location,
    name: dbStop.nome,
    order: dbStop.ordem,
    isPickupPoint: dbStop.ponto_embarque_fixo,
    time: dbStop.horario || undefined,
  };
}

/**
 * Converte PickupPoint do formato TypeScript para formato do banco
 */
function pickupPointToDb(point: PickupPoint): any {
  return {
    id: point.id,
    localizacao_dados: point.location,
    nome: point.name,
    descricao: point.description || null,
    rotas_ids: point.driverRouteIds,
    ativo: point.isActive,
  };
}

/**
 * Converte PickupPoint do formato do banco para formato TypeScript
 */
function pickupPointFromDb(dbPoint: any): PickupPoint {
  return {
    id: dbPoint.id,
    location: dbPoint.localizacao_dados as Location,
    name: dbPoint.nome,
    description: dbPoint.descricao || undefined,
    driverRouteIds: dbPoint.rotas_ids || [],
    isActive: dbPoint.ativo,
    createdAt: dbPoint.criado_em,
    updatedAt: dbPoint.atualizado_em,
  };
}

/**
 * Busca todas as rotas de motoristas
 */
export async function getAllDriverRoutes(): Promise<DriverRoute[]> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    console.log('📦 Buscando rotas do localStorage (Supabase não configurado)');
    return localStorageService.getAllDriverRoutes();
  }

  try {
    console.log('🔍 Buscando rotas no Supabase...');
    // Buscar rotas
    const { data: routes, error: routesError } = await supabase
      .from('rotas_motoristas')
      .select('*')
      .eq('ativa', true)
      .order('criado_em', { ascending: false });

    if (routesError) {
      console.error('❌ Erro ao buscar rotas:', routesError);
      // Se for erro de RLS ou autenticação, usar localStorage
      if (routesError.code === '42501' || routesError.code === 'PGRST301') {
        console.log('⚠️ Erro de permissão (RLS). Usando localStorage...');
        return localStorageService.getAllDriverRoutes();
      }
      throw routesError;
    }
    if (!routes) {
      console.log('📭 Nenhuma rota encontrada no Supabase');
      // Verificar se há rotas no localStorage para retornar também
      const localRoutes = localStorageService.getAllDriverRoutes();
      if (localRoutes.length > 0) {
        console.log(`📦 Encontradas ${localRoutes.length} rota(s) no localStorage`);
        return localRoutes;
      }
      return [];
    }

    console.log(`✅ ${routes.length} rota(s) encontrada(s) no Supabase`);

    // Buscar motoristas
    const employees = await getAllEmployees();

    // Buscar paradas para cada rota
    const routesWithStops = await Promise.all(
      routes.map(async (route) => {
        const { data: stops, error: stopsError } = await supabase
          .from('paradas_rotas')
          .select('*')
          .eq('rota_motorista_id', route.id)
          .order('ordem', { ascending: true });

        if (stopsError) {
          console.error('⚠️ Erro ao buscar paradas para rota', route.id, ':', stopsError);
        }

        const driver = employees.find(emp => emp.id === route.motorista_id);
        const driverRoute = driverRouteFromDb(route, driver);
        driverRoute.stops = stops ? stops.map(routeStopFromDb) : [];
        return driverRoute;
      })
    );

    console.log(`✅ ${routesWithStops.length} rota(s) processada(s) com sucesso`);
    
    // Mesclar com rotas do localStorage (caso haja)
    const localRoutes = localStorageService.getAllDriverRoutes();
    if (localRoutes.length > 0) {
      console.log(`📦 Mesclando com ${localRoutes.length} rota(s) do localStorage`);
      const mergedRoutes = [...routesWithStops];
      localRoutes.forEach(localRoute => {
        if (!mergedRoutes.find(r => r.id === localRoute.id)) {
          mergedRoutes.push(localRoute);
        }
      });
      return mergedRoutes;
    }
    
    return routesWithStops;
  } catch (error: any) {
    console.error('❌ Erro ao buscar rotas de motoristas do Supabase:', error);
    console.log('📦 Fazendo fallback para localStorage...');
    // Fallback para localStorage em caso de erro
    return localStorageService.getAllDriverRoutes();
  }
}

/**
 * Busca uma rota de motorista por ID
 */
export async function getDriverRouteById(id: string): Promise<DriverRoute | null> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.getDriverRouteById(id);
  }

  try {
    const { data: route, error } = await supabase
      .from('rotas_motoristas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!route) return null;

    // Buscar paradas
    const { data: stops } = await supabase
      .from('paradas_rotas')
      .select('*')
      .eq('rota_motorista_id', id)
      .order('ordem', { ascending: true });

    const employees = await getAllEmployees();
    const driver = employees.find(emp => emp.id === route.motorista_id);
    const driverRoute = driverRouteFromDb(route, driver);
    driverRoute.stops = stops ? stops.map(routeStopFromDb) : [];

    return driverRoute;
  } catch (error) {
    console.error('Erro ao buscar rota de motorista:', error);
    return localStorageService.getDriverRouteById(id);
  }
}

/**
 * Cria uma nova rota de motorista
 */
export async function createDriverRoute(data: DriverRouteFormData): Promise<DriverRoute> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    console.log('📦 Usando localStorage (Supabase não configurado)');
    return localStorageService.createDriverRoute(data);
  }

  try {
    console.log('💾 Tentando salvar rota no Supabase...', data);
    const routeData = driverRouteToDb(data);
    console.log('📤 Dados convertidos para banco:', routeData);

    // Inserir rota
    const { data: newRoute, error: routeError } = await supabase
      .from('rotas_motoristas')
      .insert(routeData)
      .select()
      .single();

    if (routeError) {
      console.error('❌ Erro ao inserir rota no Supabase:', routeError);
      // Se for erro de RLS ou autenticação, fazer fallback para localStorage
      if (routeError.code === '42501' || routeError.code === 'PGRST301') {
        console.log('⚠️ Erro de permissão (RLS). Usando localStorage...');
        throw routeError; // Será capturado e fará fallback
      }
      throw routeError;
    }
    if (!newRoute) {
      console.error('❌ Nenhuma rota retornada do Supabase');
      throw new Error('Falha ao criar rota de motorista');
    }

    console.log('✅ Rota criada no Supabase:', newRoute.id);

    // Inserir paradas se houver
    if (data.stops && data.stops.length > 0) {
      const stopsToInsert = data.stops.map(stop => routeStopToDb(stop, newRoute.id));
      console.log('📤 Inserindo paradas:', stopsToInsert.length);
      const { error: stopsError } = await supabase
        .from('paradas_rotas')
        .insert(stopsToInsert);

      if (stopsError) {
        console.error('⚠️ Erro ao inserir paradas:', stopsError);
        // Não falha a criação da rota se as paradas falharem
      } else {
        console.log('✅ Paradas inseridas com sucesso');
      }
    }

    // Buscar rota completa para retornar
    const fullRoute = await getDriverRouteById(newRoute.id);
    if (!fullRoute) {
      console.warn('⚠️ Rota criada mas não encontrada ao buscar. Retornando dados básicos.');
      const employees = await getAllEmployees();
      const driver = employees.find(emp => emp.id === data.driverId);
      return driverRouteFromDb(newRoute, driver);
    }
    
    console.log('✅ Rota completa recuperada:', fullRoute.id);
    return fullRoute;
  } catch (error) {
    console.error('❌ Erro ao criar rota de motorista no Supabase:', error);
    console.log('📦 Fazendo fallback para localStorage...');
    // Fallback para localStorage em caso de erro
    const fallbackRoute = await localStorageService.createDriverRoute(data);
    console.log('✅ Rota salva no localStorage:', fallbackRoute.id);
    return fallbackRoute;
  }
}

/**
 * Atualiza uma rota de motorista
 */
export async function updateDriverRoute(
  id: string,
  data: Partial<DriverRouteFormData>
): Promise<DriverRoute> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.updateDriverRoute(id, data);
  }

  try {
    const routeData: any = {};
    if (data.driverId !== undefined) routeData.motorista_id = data.driverId;
    if (data.name !== undefined) routeData.nome = data.name;
    if (data.origin !== undefined) routeData.origem_dados = data.origin;
    if (data.destination !== undefined) routeData.destino_dados = data.destination;
    if (data.path !== undefined) routeData.caminho = data.path;
    if (data.color !== undefined) routeData.cor = data.color;
    if (data.capacity !== undefined) routeData.capacidade = data.capacity;
    if (data.schedule !== undefined) routeData.horarios = data.schedule;

    const { error } = await supabase
      .from('rotas_motoristas')
      .update(routeData)
      .eq('id', id);

    if (error) throw error;

    // Atualizar paradas se fornecidas
    if (data.stops !== undefined) {
      // Deletar paradas antigas
      await supabase
        .from('paradas_rotas')
        .delete()
        .eq('rota_motorista_id', id);

      // Inserir novas paradas
      if (data.stops.length > 0) {
        const stopsToInsert = data.stops.map(stop => routeStopToDb(stop, id));
        const { error: stopsError } = await supabase
          .from('paradas_rotas')
          .insert(stopsToInsert);

        if (stopsError) {
          console.error('Erro ao atualizar paradas:', stopsError);
        }
      }
    }

    return await getDriverRouteById(id) || {} as DriverRoute;
  } catch (error) {
    console.error('Erro ao atualizar rota de motorista:', error);
    return localStorageService.updateDriverRoute(id, data);
  }
}

/**
 * Remove uma rota de motorista
 */
export async function deleteDriverRoute(id: string): Promise<void> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.deleteDriverRoute(id);
  }

  try {
    // As paradas serão deletadas automaticamente por CASCADE
    const { error } = await supabase
      .from('rotas_motoristas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar rota de motorista:', error);
    return localStorageService.deleteDriverRoute(id);
  }
}

/**
 * Busca todas as atribuições de rotas
 */
export async function getAllDriverRouteAssignments(): Promise<DriverRouteAssignment[]> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.getAllDriverRouteAssignments();
  }

  try {
    const { data, error } = await supabase
      .from('atribuicoes_rotas_motoristas')
      .select('*')
      .eq('ativa', true);

    if (error) throw error;
    if (!data) return [];

    return data.map((assignment: any) => ({
      id: assignment.id,
      employeeId: assignment.colaborador_id,
      driverRouteId: assignment.rota_motorista_id,
      assignedAt: assignment.atribuida_em,
      isActive: assignment.ativa,
    }));
  } catch (error) {
    console.error('Erro ao buscar atribuições:', error);
    return localStorageService.getAllDriverRouteAssignments();
  }
}

/**
 * Atribui um colaborador a uma rota de motorista
 */
export async function assignEmployeeToDriverRoute(
  employeeId: string,
  driverRouteId: string
): Promise<DriverRouteAssignment> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.assignEmployeeToDriverRoute(employeeId, driverRouteId);
  }

  try {
    const { data, error } = await supabase
      .from('atribuicoes_rotas_motoristas')
      .insert({
        colaborador_id: employeeId,
        rota_motorista_id: driverRouteId,
        atribuida_em: new Date().toISOString(),
        ativa: true,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Falha ao criar atribuição');

    return {
      id: data.id,
      employeeId: data.colaborador_id,
      driverRouteId: data.rota_motorista_id,
      assignedAt: data.atribuida_em,
      isActive: data.ativa,
    };
  } catch (error) {
    console.error('Erro ao atribuir colaborador à rota:', error);
    return localStorageService.assignEmployeeToDriverRoute(employeeId, driverRouteId);
  }
}

/**
 * Remove a atribuição de um colaborador de uma rota
 */
export async function unassignEmployeeFromDriverRoute(
  employeeId: string,
  driverRouteId: string
): Promise<void> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.unassignEmployeeFromDriverRoute(employeeId, driverRouteId);
  }

  try {
    const { error } = await supabase
      .from('atribuicoes_rotas_motoristas')
      .update({ ativa: false })
      .eq('colaborador_id', employeeId)
      .eq('rota_motorista_id', driverRouteId);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao remover atribuição:', error);
    return localStorageService.unassignEmployeeFromDriverRoute(employeeId, driverRouteId);
  }
}

/**
 * Busca colaboradores atribuídos a uma rota
 */
export async function getAssignedEmployeesForDriverRoute(
  driverRouteId: string
): Promise<Employee[]> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.getAssignedEmployeesForDriverRoute(driverRouteId);
  }

  try {
    const { data, error } = await supabase
      .from('atribuicoes_rotas_motoristas')
      .select('colaborador_id')
      .eq('rota_motorista_id', driverRouteId)
      .eq('ativa', true);

    if (error) throw error;
    if (!data) return [];

    const employeeIds = data.map(a => a.colaborador_id);
    const employees = await getAllEmployees();
    return employees.filter(emp => employeeIds.includes(emp.id));
  } catch (error) {
    console.error('Erro ao buscar colaboradores atribuídos:', error);
    return localStorageService.getAssignedEmployeesForDriverRoute(driverRouteId);
  }
}

// ==================== FUNÇÕES DE PONTOS DE EMBARQUE ====================

/**
 * Busca todos os pontos de embarque
 */
export async function getAllPickupPoints(): Promise<PickupPoint[]> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.getAllPickupPoints();
  }

  try {
    const { data, error } = await supabase
      .from('pontos_embarque')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(pickupPointFromDb);
  } catch (error) {
    console.error('Erro ao buscar pontos de embarque:', error);
    return localStorageService.getAllPickupPoints();
  }
}

/**
 * Busca pontos de embarque ativos
 */
export async function getActivePickupPoints(): Promise<PickupPoint[]> {
  const points = await getAllPickupPoints();
  return points.filter(p => p.isActive);
}

/**
 * Busca pontos de embarque de uma rota específica
 */
export async function getPickupPointsByRoute(routeId: string): Promise<PickupPoint[]> {
  const points = await getAllPickupPoints();
  return points.filter(p => p.driverRouteIds.includes(routeId) && p.isActive);
}

/**
 * Cria um novo ponto de embarque
 */
export async function createPickupPoint(
  location: Location,
  name: string,
  description?: string,
  driverRouteIds: string[] = []
): Promise<PickupPoint> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.createPickupPoint(location, name, description, driverRouteIds);
  }

  try {
    const { data, error } = await supabase
      .from('pontos_embarque')
      .insert({
        localizacao_dados: location,
        nome: name,
        descricao: description || null,
        rotas_ids: driverRouteIds,
        ativo: true,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Falha ao criar ponto de embarque');

    return pickupPointFromDb(data);
  } catch (error) {
    console.error('Erro ao criar ponto de embarque:', error);
    return localStorageService.createPickupPoint(location, name, description, driverRouteIds);
  }
}

/**
 * Atualiza um ponto de embarque
 */
export async function updatePickupPoint(
  id: string,
  data: Partial<PickupPoint>
): Promise<PickupPoint> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.updatePickupPoint(id, data);
  }

  try {
    const updateData: any = {};
    if (data.location !== undefined) updateData.localizacao_dados = data.location;
    if (data.name !== undefined) updateData.nome = data.name;
    if (data.description !== undefined) updateData.descricao = data.description;
    if (data.driverRouteIds !== undefined) updateData.rotas_ids = data.driverRouteIds;
    if (data.isActive !== undefined) updateData.ativo = data.isActive;

    const { error } = await supabase
      .from('pontos_embarque')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    const updated = await getAllPickupPoints();
    const point = updated.find(p => p.id === id);
    if (!point) throw new Error('Ponto de embarque não encontrado após atualização');

    return point;
  } catch (error) {
    console.error('Erro ao atualizar ponto de embarque:', error);
    return localStorageService.updatePickupPoint(id, data);
  }
}

/**
 * Remove um ponto de embarque
 */
export async function deletePickupPoint(id: string): Promise<void> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.deletePickupPoint(id);
  }

  try {
    const { error } = await supabase
      .from('pontos_embarque')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar ponto de embarque:', error);
    return localStorageService.deletePickupPoint(id);
  }
}

/**
 * Adiciona uma rota a um ponto de embarque
 */
export async function addRouteToPickupPoint(
  pickupPointId: string,
  routeId: string
): Promise<void> {
  const point = await getAllPickupPoints().then(points => points.find(p => p.id === pickupPointId));
  if (point && !point.driverRouteIds.includes(routeId)) {
    await updatePickupPoint(pickupPointId, {
      driverRouteIds: [...point.driverRouteIds, routeId],
    });
  }
}

/**
 * Remove uma rota de um ponto de embarque
 */
export async function removeRouteFromPickupPoint(
  pickupPointId: string,
  routeId: string
): Promise<void> {
  const point = await getAllPickupPoints().then(points => points.find(p => p.id === pickupPointId));
  if (point) {
    await updatePickupPoint(pickupPointId, {
      driverRouteIds: point.driverRouteIds.filter(id => id !== routeId),
    });
  }
}

