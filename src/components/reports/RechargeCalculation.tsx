import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Route, 
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  Bus,
  Calculator
} from 'lucide-react';
import { Employee } from '../../types/employee';
import { getAllEmployees } from '../../services/employeeServiceSupabase';

interface EmployeeRechargeData {
  employee: Employee;
  dailyCost: number;
  weeklyCost: number;
  monthlyCost: number;
  hasRouteToWork: boolean;
  hasRouteFromWork: boolean;
  totalRoutes: number;
}

export function RechargeCalculation() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [periodType, setPeriodType] = useState<'days' | 'weeks'>('weeks');
  const [periodValue, setPeriodValue] = useState<number>(1); // 1 semana por padrão
  const [workingDaysPerWeek, setWorkingDaysPerWeek] = useState<number>(5);

  // Carregar colaboradores
  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployees();
  }, []);

  // Calcular dados de recarga para cada colaborador
  const rechargeData = useMemo<EmployeeRechargeData[]>(() => {
    return employees.map(employee => {
      let dailyCost = 0;
      let hasRouteToWork = false;
      let hasRouteFromWork = false;

      // Calcular custo diário baseado nas rotas atribuídas
      if (employee.routeToWork?.isActive && employee.routeToWork.route) {
        dailyCost += employee.routeToWork.route.totalCost;
        hasRouteToWork = true;
      }

      if (employee.routeFromWork?.isActive && employee.routeFromWork.route) {
        dailyCost += employee.routeFromWork.route.totalCost;
        hasRouteFromWork = true;
      }

      const weeklyCost = dailyCost * workingDaysPerWeek;
      const monthlyCost = weeklyCost * 4; // Aproximação: 4 semanas por mês

      return {
        employee,
        dailyCost,
        weeklyCost,
        monthlyCost,
        hasRouteToWork,
        hasRouteFromWork,
        totalRoutes: (hasRouteToWork ? 1 : 0) + (hasRouteFromWork ? 1 : 0),
      };
    });
  }, [employees, workingDaysPerWeek]);

  // Filtrar apenas colaboradores com rotas atribuídas
  const employeesWithRoutes = rechargeData.filter(data => data.totalRoutes > 0);

  // Calcular totais
  const totals = useMemo(() => {
    const totalDaily = employeesWithRoutes.reduce((sum, data) => sum + data.dailyCost, 0);
    const totalWeekly = employeesWithRoutes.reduce((sum, data) => sum + data.weeklyCost, 0);
    const totalMonthly = employeesWithRoutes.reduce((sum, data) => sum + data.monthlyCost, 0);

    // Calcular para o período selecionado
    let periodTotal = 0;
    if (periodType === 'days') {
      periodTotal = totalDaily * periodValue;
    } else {
      periodTotal = totalWeekly * periodValue;
    }

    return {
      daily: totalDaily,
      weekly: totalWeekly,
      monthly: totalMonthly,
      period: periodTotal,
    };
  }, [employeesWithRoutes, periodType, periodValue]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const employeesCount = employeesWithRoutes.length;
    const totalEmployees = employees.length;
    const averageDaily = employeesCount > 0 ? totals.daily / employeesCount : 0;
    const averagePeriod = employeesCount > 0 ? totals.period / employeesCount : 0;

    return {
      employeesWithRoutes: employeesCount,
      totalEmployees,
      averageDaily,
      averagePeriod,
      coverage: totalEmployees > 0 ? (employeesCount / totalEmployees) * 100 : 0,
    };
  }, [employeesWithRoutes, employees.length, totals]);

  const handleExport = () => {
    // Criar CSV com os dados
    const csvRows = [
      ['Colaborador', 'Email', 'Cargo', 'Departamento', 'Custo Diário', 'Custo Semanal', 'Custo Mensal', 'Rotas Ativas'].join(','),
      ...employeesWithRoutes.map(data => [
        data.employee.name,
        data.employee.email,
        data.employee.position,
        data.employee.department || '',
        `R$ ${data.dailyCost.toFixed(2)}`,
        `R$ ${data.weeklyCost.toFixed(2)}`,
        `R$ ${data.monthlyCost.toFixed(2)}`,
        `${data.totalRoutes} (${data.hasRouteToWork ? 'Ida' : ''}${data.hasRouteToWork && data.hasRouteFromWork ? ' + ' : ''}${data.hasRouteFromWork ? 'Volta' : ''})`
      ].join(','))
    ];

    const csv = csvRows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `recarga_${periodType}_${periodValue}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#C4161C] border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Carregando colaboradores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Cálculo de Recarga</h2>
              <p className="text-sm text-gray-600">Análise de custos de transporte por colaborador</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </motion.button>
        </div>

        {/* Controles de Período */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Tipo de Período
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodType('days')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  periodType === 'days'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                Dias
              </button>
              <button
                onClick={() => setPeriodType('weeks')}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                  periodType === 'weeks'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-blue-50'
                }`}
              >
                Semanas
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              {periodType === 'days' ? 'Dias' : 'Semanas'}: {periodValue}
            </label>
            <input
              type="range"
              min="1"
              max={periodType === 'days' ? '30' : '12'}
              value={periodValue}
              onChange={(e) => setPeriodValue(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#C4161C]"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>{periodType === 'days' ? '30' : '12'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Dias Úteis/Semana
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={workingDaysPerWeek}
              onChange={(e) => setWorkingDaysPerWeek(Math.max(1, Math.min(7, Number(e.target.value))))}
              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C4161C]"
            />
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6" />
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">Total do Período</p>
            <p className="text-2xl font-bold">R$ {totals.period.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">
              {periodValue} {periodType === 'days' ? 'dia(s)' : 'semana(s)'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6" />
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">Custo Diário Total</p>
            <p className="text-2xl font-bold">R$ {totals.daily.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">
              {employeesWithRoutes.length} colaborador(es)
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6" />
              <Route className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">Com Rotas</p>
            <p className="text-2xl font-bold">{stats.employeesWithRoutes}</p>
            <p className="text-xs opacity-75 mt-1">
              {stats.coverage.toFixed(1)}% do total
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-4 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-6 h-6" />
              <Calculator className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">Média por Colaborador</p>
            <p className="text-2xl font-bold">R$ {stats.averagePeriod.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">
              No período selecionado
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Lista de Colaboradores */}
      {employeesWithRoutes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-white/20"
        >
          <Route className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            Nenhum colaborador com rotas atribuídas
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Atribua rotas aos colaboradores para calcular os custos de recarga
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800 px-2">
            Análise por Colaborador ({employeesWithRoutes.length})
          </h3>
          {employeesWithRoutes.map((data, index) => (
            <motion.div
              key={data.employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2, scale: 1.01 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Informações do Colaborador */}
                <div className="lg:col-span-1">
                  <h4 className="text-lg font-bold text-gray-800 mb-2">{data.employee.name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{data.employee.position}</p>
                  {data.employee.department && (
                    <p className="text-xs text-gray-500 mb-4">{data.employee.department}</p>
                  )}

                  {/* Rotas Ativas */}
                  <div className="space-y-2">
                    {data.hasRouteToWork && data.employee.routeToWork && (
                      <div className="flex items-center gap-2 text-sm bg-blue-50 rounded-lg p-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-blue-800">Rota de Ida</p>
                          <p className="text-xs text-gray-600">
                            {data.employee.routeToWork.origin.name} → {data.employee.routeToWork.destination.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            R$ {data.employee.routeToWork.route.totalCost.toFixed(2)} | {data.employee.routeToWork.route.totalDuration} min
                          </p>
                        </div>
                      </div>
                    )}

                    {data.hasRouteFromWork && data.employee.routeFromWork && (
                      <div className="flex items-center gap-2 text-sm bg-purple-50 rounded-lg p-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        <div className="flex-1">
                          <p className="font-semibold text-purple-800">Rota de Volta</p>
                          <p className="text-xs text-gray-600">
                            {data.employee.routeFromWork.origin.name} → {data.employee.routeFromWork.destination.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            R$ {data.employee.routeFromWork.route.totalCost.toFixed(2)} | {data.employee.routeFromWork.route.totalDuration} min
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custos */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <p className="text-xs text-gray-600 mb-1">Custo Diário</p>
                      <p className="text-xl font-bold text-green-700">R$ {data.dailyCost.toFixed(2)}</p>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
                      <p className="text-xs text-gray-600 mb-1">Custo Semanal</p>
                      <p className="text-xl font-bold text-blue-700">R$ {data.weeklyCost.toFixed(2)}</p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-xs text-gray-600 mb-1">Custo Mensal</p>
                      <p className="text-xl font-bold text-purple-700">R$ {data.monthlyCost.toFixed(2)}</p>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <p className="text-xs text-gray-600 mb-1">Período Selecionado</p>
                      <p className="text-xl font-bold text-amber-700">
                        R$ {(periodType === 'days' 
                          ? data.dailyCost * periodValue 
                          : data.weeklyCost * periodValue).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {periodValue} {periodType === 'days' ? 'dia(s)' : 'semana(s)'}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso Visual */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                      <span>Participação no Total</span>
                      <span>{((data.dailyCost / totals.daily) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(data.dailyCost / totals.daily) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Resumo Final */}
      {employeesWithRoutes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] rounded-2xl shadow-2xl p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Resumo Final</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Total do Período</p>
              <p className="text-3xl font-bold">R$ {totals.period.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                {periodValue} {periodType === 'days' ? 'dia(s)' : 'semana(s)'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Custo Diário</p>
              <p className="text-3xl font-bold">R$ {totals.daily.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                {employeesWithRoutes.length} colaborador(es)
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Custo Semanal</p>
              <p className="text-3xl font-bold">R$ {totals.weekly.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                {workingDaysPerWeek} dias úteis
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm opacity-90 mb-1">Custo Mensal</p>
              <p className="text-3xl font-bold">R$ {totals.monthly.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">
                Estimativa (4 semanas)
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

