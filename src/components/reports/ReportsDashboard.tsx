import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Route, 
  Users, 
  AlertTriangle,
  Target,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Coins,
  Bus,
  Clock,
  Activity,
  Gauge,
  LineChart,
  Filter,
  X
} from 'lucide-react';

type ReportSection = 'overview' | 'operational' | 'demand' | 'comparative' | 'employees';

export function ReportsDashboard() {
  const [activeSection, setActiveSection] = useState<ReportSection>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<'7' | '30' | '90' | 'custom'>('30');
  const [routeTypeFilter, setRouteTypeFilter] = useState<'all' | 'urbano' | 'metropolitano'>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Dados conceituais para demonstração (serão substituídos por dados reais no futuro)
  const costMetrics = {
    totalMonthly: 125000,
    previousMonth: 142000,
    savings: 17000,
    savingsPercentage: 12.0,
    averagePerRoute: 1250,
    averagePerEmployee: 3125,
    fuelCost: 45000,
    maintenanceCost: 28000,
    personnelCost: 52000,
  };

  const efficiencyMetrics = {
    routeOptimization: 87.5,
    previousPeriod: 82.3,
    improvement: 5.2,
    wasteReduction: 23.4,
    utilizationRate: 91.2,
    onTimePerformance: 88.7,
    averageSpeed: 28.5,
  };

  const operationalMetrics = {
    totalRoutes: 100,
    activeVehicles: 45,
    totalTrips: 1250,
    averageDistance: 18.5,
    averageDuration: 42,
    peakHourEfficiency: 76.3,
    offPeakEfficiency: 92.1,
  };

  const demandMetrics = {
    dailyPassengers: 125000,
    peakHourPassengers: 45000,
    averageLoadFactor: 78.5,
    routeUtilization: 85.2,
    demandGrowth: 8.3,
    seasonalVariation: 12.5,
  };

  const integrationMetrics = {
    totalIntegrations: 245,
    averageIntegrationsPerRoute: 2.45,
    integrationEfficiency: 88.2,
    connectionPoints: 28,
    seamlessTransfers: 92.5,
    waitTimeAtStations: 8.5,
  };

  const routeTypeAnalysis = {
    urbano: {
      count: 65,
      avgCost: 950,
      avgDuration: 35,
      utilization: 88.5,
    },
    metropolitano: {
      count: 35,
      avgCost: 1850,
      avgDuration: 65,
      utilization: 76.2,
    },
  };

  // Métricas de uso do transporte público pelos colaboradores
  const employeeUsageMetrics = {
    totalEmployees: 40,
    employeesUsingTransport: 32,
    usageRate: 80.0,
    averageTripsPerEmployee: 18.5,
    totalEmployeeTrips: 740,
    averageDistancePerTrip: 12.8,
    averageDurationPerTrip: 38,
    totalDistanceTraveled: 9472,
    totalTimeSpent: 28120,
    averageMonthlyCost: 162.5,
    totalMonthlyCost: 5200,
    savingsVsPrivateTransport: 15600,
  };

  const employeePatterns = {
    peakHourUsers: 24,
    offPeakUsers: 8,
    regularUsers: 28,
    occasionalUsers: 4,
    mostUsedRoute: 'Centro - Savassi',
    averageRoutesPerEmployee: 3.2,
    mostActiveDepartment: 'Operações',
    leastActiveDepartment: 'Administrativo',
  };

  const departmentAnalysis = {
    operacoes: {
      employees: 15,
      usageRate: 93.3,
      avgTrips: 22.5,
      avgDistance: 15.2,
      totalCost: 2100,
    },
    comercial: {
      employees: 12,
      usageRate: 83.3,
      avgTrips: 16.8,
      avgDistance: 11.5,
      totalCost: 1450,
    },
    administrativo: {
      employees: 8,
      usageRate: 62.5,
      avgTrips: 12.3,
      avgDistance: 8.9,
      totalCost: 850,
    },
    rh: {
      employees: 5,
      usageRate: 80.0,
      avgTrips: 15.2,
      avgDistance: 10.3,
      totalCost: 800,
    },
  };

  const topRoutesByEmployees = [
    { route: 'Centro - Savassi', users: 18, trips: 324, avgDuration: 25 },
    { route: 'Pampulha - Centro', users: 15, trips: 270, avgDuration: 42 },
    { route: 'Barreiro - Savassi', users: 12, trips: 216, avgDuration: 55 },
    { route: 'Venda Nova - Centro', users: 10, trips: 180, avgDuration: 48 },
    { route: 'Contagem - Centro', users: 8, trips: 144, avgDuration: 38 },
  ];

  const employeeEfficiency = {
    timeSaved: 1250,
    costSaved: 15600,
    co2Saved: 285,
    productivityGain: 12.5,
    satisfactionScore: 87.5,
  };

  const trends = {
    costTrend: -12.5,
    efficiencyTrend: 5.2,
    utilizationTrend: 3.1,
    demandTrend: 8.3,
    coverageTrend: 4.2,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const sections: { id: ReportSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'operational', label: 'Performance Operacional', icon: <Activity className="w-5 h-5" /> },
    { id: 'demand', label: 'Demanda e Utilização', icon: <Users className="w-5 h-5" /> },
    { id: 'comparative', label: 'Análise Comparativa', icon: <LineChart className="w-5 h-5" /> },
    { id: 'employees', label: 'Uso por Colaboradores', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Relatórios e Análises</h2>
              <p className="text-sm text-gray-600">Painel estratégico de análise de transporte público</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar Relatório
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Painel de Filtros */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20 overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-[#C4161C]" />
              <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
            </div>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Período */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Período
              </label>
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as '7' | '30' | '90' | 'custom')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent bg-white text-gray-700"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
                <option value="custom">Período personalizado</option>
              </select>
            </div>

            {/* Filtro de Tipo de Rota */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Route className="w-4 h-4 inline mr-1" />
                Tipo de Rota
              </label>
              <select
                value={routeTypeFilter}
                onChange={(e) => setRouteTypeFilter(e.target.value as 'all' | 'urbano' | 'metropolitano')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent bg-white text-gray-700"
              >
                <option value="all">Todas as rotas</option>
                <option value="urbano">Rotas Urbanas</option>
                <option value="metropolitano">Rotas Metropolitanas</option>
              </select>
            </div>

            {/* Filtro de Departamento (apenas para seção de colaboradores) */}
            {activeSection === 'employees' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Departamento
                </label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent bg-white text-gray-700"
                >
                  <option value="all">Todos os departamentos</option>
                  <option value="operacoes">Operações</option>
                  <option value="comercial">Comercial</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="rh">RH</option>
                </select>
              </div>
            )}

            {/* Espaço vazio quando não está na seção de colaboradores */}
            {activeSection !== 'employees' && <div></div>}
          </div>

          {/* Botão de Limpar Filtros */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setPeriodFilter('30');
                setRouteTypeFilter('all');
                setDepartmentFilter('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </motion.div>
      )}

      {/* Navegação de Seções */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 border border-white/20"
      >
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.icon}
              {section.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* VISÃO GERAL */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Cards de Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-red-600" />
                </div>
                <div className={`flex items-center gap-1 ${trends.costTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trends.costTrend < 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  <span className="text-sm font-semibold">{Math.abs(trends.costTrend)}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Custo Total Mensal</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(costMetrics.totalMonthly)}</p>
              <p className="text-xs text-gray-600">vs. {formatCurrency(costMetrics.previousMonth)} mês anterior</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Coins className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingDown className="w-4 h-4" />
                  <span className="text-sm font-semibold">{costMetrics.savingsPercentage}%</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Economia Realizada</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(costMetrics.savings)}</p>
              <p className="text-xs text-gray-600">Redução em relação ao mês anterior</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-semibold">{formatPercentage(trends.efficiencyTrend)}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Eficiência de Rotas</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{efficiencyMetrics.routeOptimization}%</p>
              <p className="text-xs text-gray-600">vs. {efficiencyMetrics.previousPeriod}% período anterior</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-semibold">{formatPercentage(trends.demandTrend)}</span>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Demanda Diária</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{formatNumber(demandMetrics.dailyPassengers)}</p>
              <p className="text-xs text-gray-600">Passageiros por dia</p>
            </motion.div>
          </div>

          {/* Resumo Executivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C4161C]" />
              Resumo Executivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Performance Geral</p>
                <p className="text-2xl font-bold text-blue-600 mb-1">{efficiencyMetrics.routeOptimization}%</p>
                <p className="text-xs text-gray-600">Eficiência operacional consolidada</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Economia Total</p>
                <p className="text-2xl font-bold text-green-600 mb-1">{formatCurrency(costMetrics.savings)}</p>
                <p className="text-xs text-gray-600">Redução de custos no período</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Utilização</p>
                <p className="text-2xl font-bold text-purple-600 mb-1">{efficiencyMetrics.utilizationRate}%</p>
                <p className="text-xs text-gray-600">Taxa de utilização de recursos</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* PERFORMANCE OPERACIONAL */}
      {activeSection === 'operational' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Performance Operacional</h3>
                <p className="text-sm text-gray-600">Métricas de eficiência, pontualidade e utilização de recursos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Pontualidade</p>
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{efficiencyMetrics.onTimePerformance}%</p>
                <p className="text-xs text-gray-600">Taxa de chegada no horário</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Velocidade Média</p>
                  <Gauge className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{efficiencyMetrics.averageSpeed} km/h</p>
                <p className="text-xs text-gray-600">Velocidade operacional média</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Taxa de Utilização</p>
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{efficiencyMetrics.utilizationRate}%</p>
                <p className="text-xs text-gray-600">Aproveitamento de recursos</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Total de Viagens</p>
                  <Route className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{formatNumber(operationalMetrics.totalTrips)}</p>
                <p className="text-xs text-gray-600">Viagens realizadas no período</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Veículos Ativos</p>
                  <Bus className="w-4 h-4 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{operationalMetrics.activeVehicles}</p>
                <p className="text-xs text-gray-600">Frota em operação</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Eficiência Pico</p>
                  <TrendingUp className="w-4 h-4 text-red-600" />
                </div>
                <p className="text-2xl font-bold text-gray-800">{operationalMetrics.peakHourEfficiency}%</p>
                <p className="text-xs text-gray-600">Performance em horário de pico</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h4 className="text-md font-bold text-gray-800 mb-4">Análise de Tempo e Distância</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Distância Média por Rota</p>
                <p className="text-2xl font-bold text-blue-600">{operationalMetrics.averageDistance} km</p>
                <p className="text-xs text-gray-600 mt-1">Comprimento médio das rotas</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Duração Média</p>
                <p className="text-2xl font-bold text-green-600">{operationalMetrics.averageDuration} min</p>
                <p className="text-xs text-gray-600 mt-1">Tempo médio de viagem</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DEMANDA E UTILIZAÇÃO */}
      {activeSection === 'demand' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Demanda e Utilização</h3>
                <p className="text-sm text-gray-600">Análise de padrões de uso e demanda do sistema</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Passageiros Diários</p>
                <p className="text-3xl font-bold text-purple-600 mb-1">{formatNumber(demandMetrics.dailyPassengers)}</p>
                <p className="text-xs text-gray-600">Média diária de passageiros</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Horário de Pico</p>
                <p className="text-3xl font-bold text-blue-600 mb-1">{formatNumber(demandMetrics.peakHourPassengers)}</p>
                <p className="text-xs text-gray-600">Passageiros no horário de pico</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Fator de Carga</p>
                <p className="text-3xl font-bold text-green-600 mb-1">{demandMetrics.averageLoadFactor}%</p>
                <p className="text-xs text-gray-600">Ocupação média dos veículos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Utilização de Rotas</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{demandMetrics.routeUtilization}%</p>
                <p className="text-xs text-gray-600">Taxa de utilização das rotas</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Crescimento da Demanda</p>
                <p className="text-2xl font-bold text-green-600 mb-1">{formatPercentage(demandMetrics.demandGrowth)}</p>
                <p className="text-xs text-gray-600">Aumento em relação ao período anterior</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ANÁLISE COMPARATIVA */}
      {activeSection === 'comparative' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <LineChart className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Análise Comparativa</h3>
                <p className="text-sm text-gray-600">Comparações entre períodos, tipos de rota e indicadores estratégicos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="text-md font-bold text-gray-800 mb-4">Tendências Principais</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Custos</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${trends.costTrend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(trends.costTrend)}
                    </p>
                    <p className="text-xs text-gray-600">Redução de custos operacionais</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Eficiência</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(trends.efficiencyTrend)}
                    </p>
                    <p className="text-xs text-gray-600">Melhoria na eficiência</p>
                  </div>

                  <div className="p-4 bg-white rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-700">Demanda</p>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(trends.demandTrend)}
                    </p>
                    <p className="text-xs text-gray-600">Crescimento da demanda</p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <h4 className="text-md font-bold text-gray-800 mb-4">Análise de Integrações</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Total de Integrações</p>
                    <p className="text-2xl font-bold text-blue-600">{integrationMetrics.totalIntegrations}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Média por Rota</p>
                    <p className="text-2xl font-bold text-blue-600">{integrationMetrics.averageIntegrationsPerRoute}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Eficiência</p>
                    <p className="text-2xl font-bold text-blue-600">{integrationMetrics.integrationEfficiency}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* USO POR COLABORADORES */}
      {activeSection === 'employees' && (
        <div className="space-y-6">
          {/* Resumo de Uso pelos Colaboradores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Análise de Uso do Transporte Público pelos Colaboradores</h3>
                <p className="text-sm text-gray-600">Métricas e padrões de utilização do sistema de transporte pelos colaboradores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Colaboradores Ativos</p>
                <p className="text-3xl font-bold text-indigo-600 mb-1">{employeeUsageMetrics.employeesUsingTransport}</p>
                <p className="text-xs text-gray-600">de {employeeUsageMetrics.totalEmployees} total ({employeeUsageMetrics.usageRate}%)</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Total de Viagens</p>
                <p className="text-3xl font-bold text-blue-600 mb-1">{formatNumber(employeeUsageMetrics.totalEmployeeTrips)}</p>
                <p className="text-xs text-gray-600">Viagens realizadas no período</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Média por Colaborador</p>
                <p className="text-3xl font-bold text-green-600 mb-1">{employeeUsageMetrics.averageTripsPerEmployee}</p>
                <p className="text-xs text-gray-600">Viagens por colaborador</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Economia Total</p>
                <p className="text-3xl font-bold text-orange-600 mb-1">{formatCurrency(employeeUsageMetrics.savingsVsPrivateTransport)}</p>
                <p className="text-xs text-gray-600">vs. transporte privado</p>
              </div>
            </div>
          </motion.div>

          {/* Padrões de Uso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#C4161C]" />
              Padrões de Uso e Comportamento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Usuários Regulares</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{employeePatterns.regularUsers}</p>
                <p className="text-xs text-gray-600">Uso frequente do sistema</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Usuários Ocasionais</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{employeePatterns.occasionalUsers}</p>
                <p className="text-xs text-gray-600">Uso esporádico</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Horário de Pico</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{employeePatterns.peakHourUsers}</p>
                <p className="text-xs text-gray-600">Usuários em horário de pico</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Fora do Pico</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{employeePatterns.offPeakUsers}</p>
                <p className="text-xs text-gray-600">Usuários fora do pico</p>
              </div>
            </div>

            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Route className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-gray-800">Rota Mais Utilizada</p>
              </div>
              <p className="text-xl font-bold text-blue-600 mb-1">{employeePatterns.mostUsedRoute}</p>
              <p className="text-xs text-gray-600">Rota preferida pelos colaboradores</p>
            </div>
          </motion.div>

          {/* Análise por Departamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C4161C]" />
              Análise por Departamento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(departmentAnalysis).map(([dept, data]) => (
                <div key={dept} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-bold text-gray-800 capitalize">{dept}</p>
                    <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {data.usageRate}% uso
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Colaboradores:</span>
                      <span className="font-semibold">{data.employees}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Média de viagens:</span>
                      <span className="font-semibold">{data.avgTrips}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distância média:</span>
                      <span className="font-semibold">{data.avgDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Custo total:</span>
                      <span className="font-semibold text-green-600">{formatCurrency(data.totalCost)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Rotas Mais Utilizadas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-[#C4161C]" />
              Rotas Mais Utilizadas pelos Colaboradores
            </h4>

            <div className="space-y-3">
              {topRoutesByEmployees.map((route, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{route.route}</p>
                        <p className="text-xs text-gray-600">{route.users} colaboradores • {route.trips} viagens</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-700">{route.avgDuration} min</p>
                      <p className="text-xs text-gray-600">Duração média</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Métricas de Eficiência e Impacto */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#C4161C]" />
              Eficiência e Impacto do Uso pelos Colaboradores
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tempo Economizado</p>
                <p className="text-2xl font-bold text-green-600 mb-1">{formatNumber(employeeEfficiency.timeSaved)}</p>
                <p className="text-xs text-gray-600">Minutos economizados no período</p>
              </div>

              <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Economia Financeira</p>
                <p className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(employeeEfficiency.costSaved)}</p>
                <p className="text-xs text-gray-600">vs. transporte privado</p>
              </div>

              <div className="p-5 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">CO₂ Evitado</p>
                <p className="text-2xl font-bold text-purple-600 mb-1">{formatNumber(employeeEfficiency.co2Saved)}</p>
                <p className="text-xs text-gray-600">kg de CO₂ evitados</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Ganho de Produtividade</p>
                <p className="text-2xl font-bold text-orange-600 mb-1">{employeeEfficiency.productivityGain}%</p>
                <p className="text-xs text-gray-600">Melhoria na produtividade</p>
              </div>

              <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Satisfação dos Colaboradores</p>
                <p className="text-2xl font-bold text-indigo-600 mb-1">{employeeEfficiency.satisfactionScore}%</p>
                <p className="text-xs text-gray-600">Score de satisfação</p>
              </div>
            </div>
          </motion.div>

          {/* Estatísticas de Deslocamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
          >
            <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C4161C]" />
              Estatísticas de Deslocamento
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Distância Total Percorrida</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{formatNumber(employeeUsageMetrics.totalDistanceTraveled)} km</p>
                <p className="text-xs text-gray-600">Total no período</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Tempo Total Gasto</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{formatNumber(employeeUsageMetrics.totalTimeSpent)} min</p>
                <p className="text-xs text-gray-600">Tempo total de deslocamento</p>
              </div>

              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Distância Média por Viagem</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">{employeeUsageMetrics.averageDistancePerTrip} km</p>
                <p className="text-xs text-gray-600">Média por viagem</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Insight:</strong> Os colaboradores percorreram um total de {formatNumber(employeeUsageMetrics.totalDistanceTraveled)} km 
                utilizando o transporte público, com uma média de {employeeUsageMetrics.averageDistancePerTrip} km por viagem. 
                O tempo médio de deslocamento é de {employeeUsageMetrics.averageDurationPerTrip} minutos, 
                demonstrando eficiência no uso do sistema.
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Nota sobre Dados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
      >
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Os dados apresentados são conceituais e servem como base estrutural para futura integração 
          com backend real. Quando implementado, este painel exibirá dados financeiros reais, histórico persistente e 
          análises detalhadas baseadas em operações efetivas do sistema de transporte público.
        </p>
      </motion.div>
    </div>
  );
}
