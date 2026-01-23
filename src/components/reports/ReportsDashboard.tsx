import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Route, 
  Users, 
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
  X,
  Car,
  MapPin,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { getAllEmployees } from '../../services/employeeServiceSupabase';
import { getAllDriverRoutes } from '../../services/driverRouteServiceSupabase';
import { Employee } from '../../types/employee';
import { DriverRoute } from '../../types/driverRoute';
import { showToast } from '../common/Toast';

type ReportSection = 'overview' | 'routes' | 'employees' | 'ubergon' | 'recharge';

interface RouteStats {
  totalRoutes: number;
  routesToWork: number;
  routesFromWork: number;
  employeesWithRoutes: number;
  averageCost: number;
  totalCost: number;
  averageDistance: number;
  averageDuration: number;
  mostUsedOrigin: string;
  mostUsedDestination: string;
}

interface EmployeeStats {
  totalEmployees: number;
  employeesWithRoutes: number;
  employeesWithoutRoutes: number;
  usageRate: number;
  byDepartment: Record<string, {
    total: number;
    withRoutes: number;
    usageRate: number;
  }>;
}

interface UberGonStats {
  totalRoutes: number;
  activeRoutes: number;
  totalStops: number;
  totalPickupPoints: number;
  totalCapacity: number;
  currentPassengers: number;
  occupancyRate: number;
  averageStopsPerRoute: number;
}

export function ReportsDashboard() {
  const [activeSection, setActiveSection] = useState<ReportSection>('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [emps, routes] = await Promise.all([
        getAllEmployees(),
        getAllDriverRoutes(),
      ]);
      setEmployees(emps);
      setDriverRoutes(routes);
    } catch (error) {
      console.error('Erro ao carregar dados para relatórios:', error);
      showToast('Erro ao carregar dados. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular estatísticas de rotas
  const routeStats = useMemo<RouteStats>(() => {
    const routesToWork = employees.filter(emp => emp.routeToWork?.isActive).length;
    const routesFromWork = employees.filter(emp => emp.routeFromWork?.isActive).length;
    const employeesWithRoutes = employees.filter(
      emp => emp.routeToWork?.isActive || emp.routeFromWork?.isActive
    ).length;

    const allRoutes = employees
      .flatMap(emp => [
        emp.routeToWork?.isActive ? emp.routeToWork.route : null,
        emp.routeFromWork?.isActive ? emp.routeFromWork.route : null,
      ])
      .filter((route): route is NonNullable<typeof route> => route !== null);

    const totalCost = allRoutes.reduce((sum, route) => sum + (route.totalCost || 0), 0);
    const totalDistance = allRoutes.reduce((sum, route) => sum + (route.totalDistance || 0), 0);
    const totalDuration = allRoutes.reduce((sum, route) => sum + (route.totalDuration || 0), 0);

    // Contar origens e destinos mais usados
    const originCounts: Record<string, number> = {};
    const destinationCounts: Record<string, number> = {};

    employees.forEach(emp => {
      if (emp.routeToWork?.isActive) {
        const origin = emp.routeToWork.origin?.name || 'N/A';
        const dest = emp.routeToWork.destination?.name || 'N/A';
        originCounts[origin] = (originCounts[origin] || 0) + 1;
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      }
      if (emp.routeFromWork?.isActive) {
        const origin = emp.routeFromWork.origin?.name || 'N/A';
        const dest = emp.routeFromWork.destination?.name || 'N/A';
        originCounts[origin] = (originCounts[origin] || 0) + 1;
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      }
    });

    const mostUsedOrigin = Object.entries(originCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
    const mostUsedDestination = Object.entries(destinationCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

    return {
      totalRoutes: routesToWork + routesFromWork,
      routesToWork,
      routesFromWork,
      employeesWithRoutes,
      averageCost: allRoutes.length > 0 ? totalCost / allRoutes.length : 0,
      totalCost,
      averageDistance: allRoutes.length > 0 ? totalDistance / allRoutes.length : 0,
      averageDuration: allRoutes.length > 0 ? totalDuration / allRoutes.length : 0,
      mostUsedOrigin,
      mostUsedDestination,
    };
  }, [employees]);

  // Calcular estatísticas de colaboradores
  const employeeStats = useMemo<EmployeeStats>(() => {
    const employeesWithRoutes = employees.filter(
      emp => emp.routeToWork?.isActive || emp.routeFromWork?.isActive
    ).length;

    const byDepartment: Record<string, { total: number; withRoutes: number; usageRate: number }> = {};

    employees.forEach(emp => {
      const dept = emp.department || 'Sem Departamento';
      if (!byDepartment[dept]) {
        byDepartment[dept] = { total: 0, withRoutes: 0, usageRate: 0 };
      }
      byDepartment[dept].total++;
      if (emp.routeToWork?.isActive || emp.routeFromWork?.isActive) {
        byDepartment[dept].withRoutes++;
      }
    });

    Object.keys(byDepartment).forEach(dept => {
      const deptData = byDepartment[dept];
      deptData.usageRate = deptData.total > 0 
        ? (deptData.withRoutes / deptData.total) * 100 
        : 0;
    });

    return {
      totalEmployees: employees.length,
      employeesWithRoutes,
      employeesWithoutRoutes: employees.length - employeesWithRoutes,
      usageRate: employees.length > 0 
        ? (employeesWithRoutes / employees.length) * 100 
        : 0,
      byDepartment,
    };
  }, [employees]);

  // Calcular estatísticas do UberGon
  const ubergonStats = useMemo<UberGonStats>(() => {
    const activeRoutes = driverRoutes.filter(route => route.isActive);
    const totalStops = driverRoutes.reduce((sum, route) => sum + (route.stops?.length || 0), 0);
    const totalCapacity = driverRoutes.reduce((sum, route) => sum + route.capacity, 0);
    const currentPassengers = driverRoutes.reduce(
      (sum, route) => sum + (route.currentPassengers?.length || 0),
      0
    );

    return {
      totalRoutes: driverRoutes.length,
      activeRoutes: activeRoutes.length,
      totalStops,
      totalPickupPoints: 0, // Será calculado quando houver serviço de pickup points
      totalCapacity,
      currentPassengers,
      occupancyRate: totalCapacity > 0 ? (currentPassengers / totalCapacity) * 100 : 0,
      averageStopsPerRoute: driverRoutes.length > 0 ? totalStops / driverRoutes.length : 0,
    };
  }, [driverRoutes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  const sections: { id: ReportSection; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'routes', label: 'Rotas de Transporte', icon: <Route className="w-5 h-5" /> },
    { id: 'employees', label: 'Colaboradores', icon: <Users className="w-5 h-5" /> },
    { id: 'ubergon', label: 'Caronas (UberGon)', icon: <Car className="w-5 h-5" /> },
    { id: 'recharge', label: 'Recarga de Vale', icon: <Coins className="w-5 h-5" /> },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            className="w-12 h-12 border-4 border-[#C4161C] border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-600 font-medium">Carregando relatórios...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 mb-4 shadow-md border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Relatórios e Análises</h2>
              <p className="text-sm text-gray-600">Painel de análise do sistema de transporte</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              Atualizar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Navegação de Seções */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
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
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 p-3 rounded-xl">
                  <Route className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Total de Rotas</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{routeStats.totalRoutes}</p>
              <p className="text-xs text-gray-600">
                {routeStats.routesToWork} ida • {routeStats.routesFromWork} volta
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Colaboradores Ativos</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{employeeStats.employeesWithRoutes}</p>
              <p className="text-xs text-gray-600">
                de {employeeStats.totalEmployees} total ({formatPercentage(employeeStats.usageRate)})
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Custo Total</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{formatCurrency(routeStats.totalCost)}</p>
              <p className="text-xs text-gray-600">Custo médio: {formatCurrency(routeStats.averageCost)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Car className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Rotas de Caronas</h3>
              <p className="text-2xl font-bold text-gray-800 mb-1">{ubergonStats.activeRoutes}</p>
              <p className="text-xs text-gray-600">
                {ubergonStats.currentPassengers}/{ubergonStats.totalCapacity} passageiros
              </p>
            </motion.div>
          </div>

          {/* Resumo Executivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#C4161C]" />
              Resumo Executivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Distância Média</p>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {routeStats.averageDistance.toFixed(1)} km
                </p>
                <p className="text-xs text-gray-600">Por rota</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Duração Média</p>
                <p className="text-2xl font-bold text-green-600 mb-1">
                  {formatDuration(routeStats.averageDuration)}
                </p>
                <p className="text-xs text-gray-600">Por rota</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Ocupação Caronas</p>
                <p className="text-2xl font-bold text-purple-600 mb-1">
                  {formatPercentage(ubergonStats.occupancyRate)}
                </p>
                <p className="text-xs text-gray-600">Taxa de ocupação</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ROTAS DE TRANSPORTE */}
      {activeSection === 'routes' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Route className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Estatísticas de Rotas</h3>
                <p className="text-sm text-gray-600">Análise das rotas de transporte público</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Rotas de Ida</p>
                <p className="text-2xl font-bold text-gray-800">{routeStats.routesToWork}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Rotas de Volta</p>
                <p className="text-2xl font-bold text-gray-800">{routeStats.routesFromWork}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Custo Total</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(routeStats.totalCost)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Custo Médio</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(routeStats.averageCost)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Distância Média</p>
                <p className="text-2xl font-bold text-purple-600">{routeStats.averageDistance.toFixed(1)} km</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Duração Média</p>
                <p className="text-2xl font-bold text-orange-600">{formatDuration(routeStats.averageDuration)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Origem Mais Usada
                </p>
                <p className="text-xl font-bold text-blue-600">{routeStats.mostUsedOrigin}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destino Mais Usado
                </p>
                <p className="text-xl font-bold text-green-600">{routeStats.mostUsedDestination}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* COLABORADORES */}
      {activeSection === 'employees' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Análise de Colaboradores</h3>
                <p className="text-sm text-gray-600">Uso de transporte pelos colaboradores</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Total de Colaboradores</p>
                <p className="text-3xl font-bold text-indigo-600">{employeeStats.totalEmployees}</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Com Rotas</p>
                <p className="text-3xl font-bold text-green-600">{employeeStats.employeesWithRoutes}</p>
                <p className="text-xs text-gray-600 mt-1">{formatPercentage(employeeStats.usageRate)} de uso</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Sem Rotas</p>
                <p className="text-3xl font-bold text-orange-600">{employeeStats.employeesWithoutRoutes}</p>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-bold text-gray-800 mb-4">Análise por Departamento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(employeeStats.byDepartment).map(([dept, data]) => (
                  <div key={dept} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-lg font-bold text-gray-800">{dept}</p>
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {formatPercentage(data.usageRate)}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total:</span>
                        <span className="font-semibold">{data.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Com rotas:</span>
                        <span className="font-semibold text-green-600">{data.withRoutes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* UBERGON */}
      {activeSection === 'ubergon' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Estatísticas de Caronas (UberGon)</h3>
                <p className="text-sm text-gray-600">Análise do sistema de caronas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Total de Rotas</p>
                <p className="text-3xl font-bold text-purple-600">{ubergonStats.totalRoutes}</p>
                <p className="text-xs text-gray-600 mt-1">{ubergonStats.activeRoutes} ativas</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Total de Paradas</p>
                <p className="text-3xl font-bold text-blue-600">{ubergonStats.totalStops}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {ubergonStats.averageStopsPerRoute.toFixed(1)} por rota
                </p>
              </div>
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Capacidade Total</p>
                <p className="text-3xl font-bold text-green-600">{ubergonStats.totalCapacity}</p>
                <p className="text-xs text-gray-600 mt-1">passageiros</p>
              </div>
              <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Taxa de Ocupação</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatPercentage(ubergonStats.occupancyRate)}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {ubergonStats.currentPassengers}/{ubergonStats.totalCapacity} ocupados
                </p>
              </div>
            </div>

            {driverRoutes.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-bold text-gray-800 mb-4">Rotas Ativas</h4>
                <div className="space-y-3">
                  {driverRoutes.filter(r => r.isActive).slice(0, 5).map((route) => (
                    <div key={route.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{route.name}</p>
                          <p className="text-sm text-gray-600">
                            {route.origin.name} → {route.destination.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-700">
                            {route.currentPassengers?.length || 0}/{route.capacity}
                          </p>
                          <p className="text-xs text-gray-600">passageiros</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* RECARGA */}
      {activeSection === 'recharge' && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Coins className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Cálculo de Recarga</h3>
                <p className="text-sm text-gray-600">Acesse a aba "Recarga" para cálculos detalhados</p>
              </div>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800">
                Para visualizar e calcular os valores de recarga de vale transporte por colaborador,
                utilize a aba <strong>"Recarga"</strong> no menu principal.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

