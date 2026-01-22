/**
 * Serviço de Colaboradores usando Supabase
 * 
 * Esta é uma versão adaptada do employeeService.ts para usar Supabase.
 * Mantém a mesma interface pública para facilitar migração.
 * 
 * Para usar: substitua os imports de employeeService por employeeServiceSupabase
 */

import { Employee, EmployeeFormData, Address, BusCard } from '../types/employee';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import * as localStorageService from './employees/employeeService'; // Fallback

/**
 * Converte Address do formato TypeScript para formato do banco (português)
 */
function addressToDb(address: Address | Omit<Address, 'id'> & { id?: string }, employeeId: string) {
  return {
    id: address.id,
    colaborador_id: employeeId,
    rua: address.street,
    numero: address.number,
    complemento: address.complement || null,
    bairro: address.neighborhood,
    cidade: address.city,
    estado: address.state,
    cep: address.zipCode,
    latitude: address.lat || null,
    longitude: address.lng || null,
    principal: address.isMain,
  };
}

/**
 * Converte Address do formato do banco (português) para formato TypeScript
 */
function addressFromDb(dbAddress: any): Address {
  return {
    id: dbAddress.id,
    street: dbAddress.rua,
    number: dbAddress.numero,
    complement: dbAddress.complemento || undefined,
    neighborhood: dbAddress.bairro,
    city: dbAddress.cidade,
    state: dbAddress.estado,
    zipCode: dbAddress.cep,
    lat: dbAddress.latitude || undefined,
    lng: dbAddress.longitude || undefined,
    isMain: dbAddress.principal,
  };
}

/**
 * Converte BusCard do formato TypeScript para formato do banco (português)
 */
function busCardToDb(card: BusCard | Omit<BusCard, 'id'> & { id?: string }, employeeId: string) {
  return {
    id: card.id,
    colaborador_id: employeeId,
    numero_cartao: card.cardNumber,
    tipo_cartao: card.cardType || null,
    ativo: card.isActive,
  };
}

/**
 * Converte BusCard do formato do banco (português) para formato TypeScript
 */
function busCardFromDb(dbCard: any): BusCard {
  return {
    id: dbCard.id,
    cardNumber: dbCard.numero_cartao,
    cardType: dbCard.tipo_cartao || undefined,
    isActive: dbCard.ativo,
  };
}

/**
 * Converte Employee do formato do banco (português) para formato TypeScript
 */
function employeeFromDb(
  dbEmployee: any,
  addresses: any[],
  busCards: any[],
  routes?: any[]
): Employee {
  const employee: Employee = {
    id: dbEmployee.id,
    name: dbEmployee.nome,
    email: dbEmployee.email,
    phone: dbEmployee.telefone,
    document: dbEmployee.documento,
    position: dbEmployee.cargo,
    department: dbEmployee.departamento || undefined,
    addresses: addresses.map(addressFromDb),
    busCards: busCards.map(busCardFromDb),
    createdAt: dbEmployee.criado_em,
    updatedAt: dbEmployee.atualizado_em,
  };

  // Adicionar rotas se fornecidas
  if (routes) {
    const routeToWork = routes.find((r: any) => r.tipo_rota === 'ida_trabalho' && r.ativa);
    const routeFromWork = routes.find((r: any) => r.tipo_rota === 'volta_trabalho' && r.ativa);

    if (routeToWork) {
      employee.routeToWork = {
        id: routeToWork.id,
        route: routeToWork.dados_rota,
        origin: routeToWork.dados_origem,
        destination: routeToWork.dados_destino,
        assignedAt: routeToWork.atribuida_em,
        isActive: routeToWork.ativa,
      };
    }

    if (routeFromWork) {
      employee.routeFromWork = {
        id: routeFromWork.id,
        route: routeFromWork.dados_rota,
        origin: routeFromWork.dados_origem,
        destination: routeFromWork.dados_destino,
        assignedAt: routeFromWork.atribuida_em,
        isActive: routeFromWork.ativa,
      };
    }
  }

  return employee;
}

/**
 * Busca todos os colaboradores
 */
export async function getAllEmployees(): Promise<Employee[]> {
  console.log('🔍 getAllEmployees chamado');
  console.log('🔍 Supabase configurado?', isSupabaseConfigured());
  
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase não configurado, usando localStorage como fallback');
    return localStorageService.getAllEmployees();
  }

  try {
    console.log('📡 Buscando colaboradores no Supabase...');
    // Buscar colaboradores (tabela em português)
    const { data: employees, error: employeesError } = await supabase
      .from('colaboradores')
      .select('*')
      .order('criado_em', { ascending: false });

    console.log('📡 Resposta do Supabase:', { employees, employeesError });

    if (employeesError) {
      console.error('❌ Erro ao buscar colaboradores:', employeesError);
      throw employeesError;
    }
    
    if (!employees) {
      console.warn('⚠️ Nenhum colaborador encontrado');
      return [];
    }

    console.log(`✅ ${employees.length} colaborador(es) encontrado(s)`);

    // Buscar endereços, cartões e rotas para todos os colaboradores (tabelas em português)
    const employeeIds = employees.map(emp => emp.id);

    const [addressesResult, busCardsResult, routesResult] = await Promise.all([
      supabase.from('enderecos').select('*').in('colaborador_id', employeeIds),
      supabase.from('cartoes_onibus').select('*').in('colaborador_id', employeeIds),
      supabase.from('rotas_atribuidas').select('*').in('colaborador_id', employeeIds),
    ]);

    if (addressesResult.error) throw addressesResult.error;
    if (busCardsResult.error) throw busCardsResult.error;
    if (routesResult.error) throw routesResult.error;

    const addresses = addressesResult.data || [];
    const busCards = busCardsResult.data || [];
    const routes = routesResult.data || [];

    // Montar objetos Employee completos
    return employees.map(emp => {
      const empAddresses = addresses.filter(a => a.colaborador_id === emp.id);
      const empBusCards = busCards.filter(c => c.colaborador_id === emp.id);
      const empRoutes = routes.filter(r => r.colaborador_id === emp.id);
      return employeeFromDb(emp, empAddresses, empBusCards, empRoutes);
    });
  } catch (error) {
    console.error('Erro ao buscar colaboradores:', error);
    throw error;
  }
}

/**
 * Busca um colaborador por ID
 */
export async function getEmployeeById(id: string): Promise<Employee | null> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.getEmployeeById(id);
  }

  try {
    // Buscar colaborador (tabela em português)
    const { data: employee, error: employeeError } = await supabase
      .from('colaboradores')
      .select('*')
      .eq('id', id)
      .single();

    if (employeeError) {
      if (employeeError.code === 'PGRST116') {
        // Não encontrado
        return null;
      }
      throw employeeError;
    }

    if (!employee) return null;

    // Buscar dados relacionados (tabelas em português)
    const [addressesResult, busCardsResult, routesResult] = await Promise.all([
      supabase.from('enderecos').select('*').eq('colaborador_id', id),
      supabase.from('cartoes_onibus').select('*').eq('colaborador_id', id),
      supabase.from('rotas_atribuidas').select('*').eq('colaborador_id', id),
    ]);

    if (addressesResult.error) throw addressesResult.error;
    if (busCardsResult.error) throw busCardsResult.error;
    if (routesResult.error) throw routesResult.error;

    const addresses = addressesResult.data || [];
    const busCards = busCardsResult.data || [];
    const routes = routesResult.data || [];

    return employeeFromDb(employee, addresses, busCards, routes);
  } catch (error) {
    console.error('Erro ao buscar colaborador:', error);
    throw error;
  }
}

/**
 * Cria um novo colaborador
 */
export async function createEmployee(data: EmployeeFormData): Promise<Employee> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.createEmployee(data);
  }

  try {
    // Inserir colaborador (tabela em português)
    const { data: newEmployee, error: employeeError } = await supabase
      .from('colaboradores')
      .insert({
        nome: data.name,
        email: data.email,
        telefone: data.phone,
        documento: data.document,
        cargo: data.position,
        departamento: data.department || null,
      })
      .select()
      .single();

    if (employeeError) throw employeeError;
    if (!newEmployee) throw new Error('Falha ao criar colaborador');

    const employeeId = newEmployee.id;

    // Inserir endereços (tabela em português)
    if (data.addresses && data.addresses.length > 0) {
      const addressesToInsert = data.addresses.map(addr => addressToDb(addr, employeeId));
      const { error: addressesError } = await supabase
        .from('enderecos')
        .insert(addressesToInsert);

      if (addressesError) throw addressesError;
    }

    // Inserir cartões (tabela em português)
    if (data.busCards && data.busCards.length > 0) {
      const cardsToInsert = data.busCards.map(card => busCardToDb(card, employeeId));
      const { error: cardsError } = await supabase
        .from('cartoes_onibus')
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;
    }

    // Buscar colaborador completo para retornar
    return await getEmployeeById(employeeId) || newEmployee as any;
  } catch (error) {
    console.error('Erro ao criar colaborador:', error);
    throw error;
  }
}

/**
 * Atualiza um colaborador existente
 */
export async function updateEmployee(
  id: string,
  data: EmployeeFormData | Partial<Employee>
): Promise<Employee> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.updateEmployee(id, data);
  }

  try {
    // Atualizar dados básicos do colaborador (tabela em português)
    const updateData: any = {};
    if ('name' in data) updateData.nome = data.name;
    if ('email' in data) updateData.email = data.email;
    if ('phone' in data) updateData.telefone = data.phone;
    if ('document' in data) updateData.documento = data.document;
    if ('position' in data) updateData.cargo = data.position;
    if ('department' in data) updateData.departamento = data.department || null;

    if (Object.keys(updateData).length > 0) {
      const { error: employeeError } = await supabase
        .from('colaboradores')
        .update(updateData)
        .eq('id', id);

      if (employeeError) throw employeeError;
    }

    // Se for EmployeeFormData, atualizar endereços e cartões (tabelas em português)
    if ('addresses' in data && Array.isArray(data.addresses)) {
      // Buscar endereços existentes
      const { data: existingAddresses } = await supabase
        .from('enderecos')
        .select('id')
        .eq('colaborador_id', id);

      const existingIds = (existingAddresses || []).map(a => a.id);
      const newAddresses = data.addresses.filter(a => a.id && existingIds.includes(a.id));
      const addressesToInsert = data.addresses.filter(a => !a.id || !existingIds.includes(a.id));
      const addressesToDelete = existingIds.filter(id => !data.addresses.some(a => a.id === id));

      // Deletar endereços removidos
      if (addressesToDelete.length > 0) {
        await supabase.from('enderecos').delete().in('id', addressesToDelete);
      }

      // Atualizar endereços existentes
      for (const addr of newAddresses) {
        if (addr.id) {
          const { error } = await supabase
            .from('enderecos')
            .update(addressToDb(addr, id))
            .eq('id', addr.id);
          if (error) throw error;
        }
      }

      // Inserir novos endereços
      if (addressesToInsert.length > 0) {
        const toInsert = addressesToInsert.map(addr => addressToDb(addr, id));
        const { error } = await supabase.from('enderecos').insert(toInsert);
        if (error) throw error;
      }
    }

    if ('busCards' in data && Array.isArray(data.busCards)) {
      // Buscar cartões existentes
      const { data: existingCards } = await supabase
        .from('cartoes_onibus')
        .select('id')
        .eq('colaborador_id', id);

      const existingIds = (existingCards || []).map(c => c.id);
      const newCards = data.busCards.filter(c => c.id && existingIds.includes(c.id));
      const cardsToInsert = data.busCards.filter(c => !c.id || !existingIds.includes(c.id));
      const cardsToDelete = existingIds.filter(id => !data.busCards.some(c => c.id === id));

      // Deletar cartões removidos
      if (cardsToDelete.length > 0) {
        await supabase.from('cartoes_onibus').delete().in('id', cardsToDelete);
      }

      // Atualizar cartões existentes
      for (const card of newCards) {
        if (card.id) {
          const { error } = await supabase
            .from('cartoes_onibus')
            .update(busCardToDb(card, id))
            .eq('id', card.id);
          if (error) throw error;
        }
      }

      // Inserir novos cartões
      if (cardsToInsert.length > 0) {
        const toInsert = cardsToInsert.map(card => busCardToDb(card, id));
        const { error } = await supabase.from('cartoes_onibus').insert(toInsert);
        if (error) throw error;
      }
    }

    // Tratar rotas atribuídas (routeToWork e routeFromWork)
    if ('routeToWork' in data || 'routeFromWork' in data) {
      // Se routeToWork foi definido (incluindo undefined para remover)
      if ('routeToWork' in data) {
        if (data.routeToWork) {
          // Inserir ou atualizar rota de ida (UPSERT)
          const routeData = {
            id: data.routeToWork.id,
            colaborador_id: id,
            tipo_rota: 'ida_trabalho',
            dados_rota: data.routeToWork.route,
            dados_origem: data.routeToWork.origin,
            dados_destino: data.routeToWork.destination,
            atribuida_em: data.routeToWork.assignedAt,
            ativa: data.routeToWork.isActive,
          };

          // Verificar se já existe rota de ida
          const { data: existingRoutes, error: checkError } = await supabase
            .from('rotas_atribuidas')
            .select('id')
            .eq('colaborador_id', id)
            .eq('tipo_rota', 'ida_trabalho')
            .limit(1);
          
          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }
          
          const existingRoute = existingRoutes && existingRoutes.length > 0 ? existingRoutes[0] : null;

          if (existingRoute) {
            // Atualizar rota existente
            const { error } = await supabase
              .from('rotas_atribuidas')
              .update(routeData)
              .eq('id', existingRoute.id);
            if (error) {
              console.error('Erro ao atualizar rota de ida:', error);
              throw error;
            }
            console.log('✅ Rota de ida atualizada');
          } else {
            // Inserir nova rota
            const { error } = await supabase
              .from('rotas_atribuidas')
              .insert(routeData);
            if (error) {
              console.error('Erro ao inserir rota de ida:', error);
              throw error;
            }
            console.log('✅ Rota de ida inserida');
          }
        } else {
          // Remover rota de ida se for undefined
          const { error } = await supabase
            .from('rotas_atribuidas')
            .delete()
            .eq('colaborador_id', id)
            .eq('tipo_rota', 'ida_trabalho');
          if (error) {
            console.error('Erro ao remover rota de ida:', error);
            throw error;
          }
          console.log('✅ Rota de ida removida');
        }
      }

      // Se routeFromWork foi definido (incluindo undefined para remover)
      if ('routeFromWork' in data) {
        if (data.routeFromWork) {
          // Inserir ou atualizar rota de volta (UPSERT)
          const routeData = {
            id: data.routeFromWork.id,
            colaborador_id: id,
            tipo_rota: 'volta_trabalho',
            dados_rota: data.routeFromWork.route,
            dados_origem: data.routeFromWork.origin,
            dados_destino: data.routeFromWork.destination,
            atribuida_em: data.routeFromWork.assignedAt,
            ativa: data.routeFromWork.isActive,
          };

          // Verificar se já existe rota de volta
          const { data: existingRoutes, error: checkError } = await supabase
            .from('rotas_atribuidas')
            .select('id')
            .eq('colaborador_id', id)
            .eq('tipo_rota', 'volta_trabalho')
            .limit(1);
          
          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }
          
          const existingRoute = existingRoutes && existingRoutes.length > 0 ? existingRoutes[0] : null;

          if (existingRoute) {
            // Atualizar rota existente
            const { error } = await supabase
              .from('rotas_atribuidas')
              .update(routeData)
              .eq('id', existingRoute.id);
            if (error) {
              console.error('Erro ao atualizar rota de volta:', error);
              throw error;
            }
            console.log('✅ Rota de volta atualizada');
          } else {
            // Inserir nova rota
            const { error } = await supabase
              .from('rotas_atribuidas')
              .insert(routeData);
            if (error) {
              console.error('Erro ao inserir rota de volta:', error);
              throw error;
            }
            console.log('✅ Rota de volta inserida');
          }
        } else {
          // Remover rota de volta se for undefined
          const { error } = await supabase
            .from('rotas_atribuidas')
            .delete()
            .eq('colaborador_id', id)
            .eq('tipo_rota', 'volta_trabalho');
          if (error) {
            console.error('Erro ao remover rota de volta:', error);
            throw error;
          }
          console.log('✅ Rota de volta removida');
        }
      }
    }

    // Buscar colaborador atualizado
    return await getEmployeeById(id) || {} as Employee;
  } catch (error) {
    console.error('Erro ao atualizar colaborador:', error);
    throw error;
  }
}

/**
 * Deleta um colaborador
 */
export async function deleteEmployee(id: string): Promise<void> {
  // Fallback para localStorage se Supabase não estiver configurado
  if (!isSupabaseConfigured()) {
    return localStorageService.deleteEmployee(id);
  }

  try {
    // O banco tem CASCADE, então deletar o colaborador deleta automaticamente
    // endereços, cartões e rotas relacionadas (tabela em português)
    const { error } = await supabase
      .from('colaboradores')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Erro ao deletar colaborador:', error);
    throw error;
  }
}

