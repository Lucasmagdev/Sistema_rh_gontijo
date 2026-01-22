import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Route, 
  DollarSign, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Employee } from '../types/employee';
import { getAllEmployees } from '../services/employeeServiceSupabase';

interface StatusBarProps {
  refreshTrigger?: number;
}

export function StatusBar({ refreshTrigger }: StatusBarProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Carregar colaboradores
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Erro ao carregar dados para status bar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Calcular indicadores
  const indicators = useMemo(() => {
    const totalEmployees = employees.length;
    
    // Colaboradores com rotas ativas
    const employeesWithRoutes = employees.filter(emp => 
      (emp.routeToWork?.isActive) || (emp.routeFromWork?.isActive)
    ).length;

    // Total de rotas atribuídas (ativa)
    const totalActiveRoutes = employees.reduce((count, emp) => {
      return count + 
        (emp.routeToWork?.isActive ? 1 : 0) + 
        (emp.routeFromWork?.isActive ? 1 : 0);
    }, 0);

    // Calcular custo mensal estimado
    const monthlyCost = employees.reduce((total, emp) => {
      let dailyCost = 0;
      if (emp.routeToWork?.isActive && emp.routeToWork.route) {
        dailyCost += emp.routeToWork.route.totalCost;
      }
      if (emp.routeFromWork?.isActive && emp.routeFromWork.route) {
        dailyCost += emp.routeFromWork.route.totalCost;
      }
      // Assumindo 5 dias úteis por semana e 4 semanas por mês
      return total + (dailyCost * 5 * 4);
    }, 0);

    // Custo médio por colaborador (apenas os com rotas)
    const averageCostPerEmployee = employeesWithRoutes > 0
      ? monthlyCost / employeesWithRoutes
      : 0;

    // Taxa de cobertura (colaboradores com rotas / total)
    const coverageRate = totalEmployees > 0
      ? (employeesWithRoutes / totalEmployees) * 100
      : 0;

    // Total de endereços cadastrados
    const totalAddresses = employees.reduce((sum, emp) => sum + emp.addresses.length, 0);

    // Total de cartões ativos
    const totalActiveCards = employees.reduce((sum, emp) => 
      sum + emp.busCards.filter(card => card.isActive).length, 0
    );

    return {
      totalEmployees,
      employeesWithRoutes,
      totalActiveRoutes,
      monthlyCost,
      averageCostPerEmployee,
      coverageRate,
      totalAddresses,
      totalActiveCards,
    };
  }, [employees]);

  // Formatar tempo desde última atualização
  const timeSinceUpdate = useMemo(() => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  }, [lastUpdate]);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-[#8B0F14] to-[#C4161C] text-white py-2 px-6 border-b border-[#8B0F14]/50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white/80">Carregando indicadores...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#8B0F14] via-[#A01218] to-[#C4161C] text-white py-2.5 px-6 border-b border-[#8B0F14]/50 shadow-lg"
    >
      <div className="container mx-auto overflow-hidden relative">
        <div className="flex items-center justify-between gap-4">
          {/* Indicadores Principais - Carrossel */}
          <div className="flex-1 overflow-hidden">
            <motion.div 
              className="flex items-center gap-6"
              animate={{
                x: ['0%', '-100%'],
              }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                width: '200%',
              }}
            >
              {/* Primeira cópia dos indicadores */}
              <div className="flex items-center gap-6 flex-shrink-0" style={{ width: '50%' }}>
            {/* Total de Colaboradores */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Colaboradores</p>
                <p className="text-sm font-bold text-white">{indicators.totalEmployees}</p>
              </div>
            </motion.div>

            {/* Rotas Ativas */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Route className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Rotas Ativas</p>
                <p className="text-sm font-bold text-white">{indicators.totalActiveRoutes}</p>
              </div>
            </motion.div>

            {/* Custo Mensal */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Custo Mensal</p>
                <p className="text-sm font-bold text-white">
                  R$ {indicators.monthlyCost.toFixed(2)}
                </p>
              </div>
            </motion.div>

            {/* Custo Médio */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Média/Colaborador</p>
                <p className="text-sm font-bold text-white">
                  R$ {indicators.averageCostPerEmployee.toFixed(2)}
                </p>
              </div>
            </motion.div>

            {/* Taxa de Cobertura */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Cobertura</p>
                <p className="text-sm font-bold text-white">
                  {indicators.coverageRate.toFixed(1)}%
                </p>
              </div>
            </motion.div>

            {/* Endereços Cadastrados */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default hidden lg:flex"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Endereços</p>
                <p className="text-sm font-bold text-white">{indicators.totalAddresses}</p>
              </div>
            </motion.div>

            {/* Cartões Ativos */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 group cursor-default hidden xl:flex"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/80 leading-tight">Cartões Ativos</p>
                <p className="text-sm font-bold text-white">{indicators.totalActiveCards}</p>
              </div>
            </motion.div>
              </div>
              
              {/* Segunda cópia dos indicadores para efeito infinito */}
              <div className="flex items-center gap-6 flex-shrink-0" style={{ width: '50%' }}>
                {/* Total de Colaboradores */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Colaboradores</p>
                    <p className="text-sm font-bold text-white">{indicators.totalEmployees}</p>
                  </div>
                </motion.div>

                {/* Rotas Ativas */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <Route className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Rotas Ativas</p>
                    <p className="text-sm font-bold text-white">{indicators.totalActiveRoutes}</p>
                  </div>
                </motion.div>

                {/* Custo Mensal */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Custo Mensal</p>
                    <p className="text-sm font-bold text-white">
                      R$ {indicators.monthlyCost.toFixed(2)}
                    </p>
                  </div>
                </motion.div>

                {/* Custo Médio */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Média/Colaborador</p>
                    <p className="text-sm font-bold text-white">
                      R$ {indicators.averageCostPerEmployee.toFixed(2)}
                    </p>
                  </div>
                </motion.div>

                {/* Taxa de Cobertura */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Cobertura</p>
                    <p className="text-sm font-bold text-white">
                      {indicators.coverageRate.toFixed(1)}%
                    </p>
                  </div>
                </motion.div>

                {/* Endereços Cadastrados */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default hidden lg:flex"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Endereços</p>
                    <p className="text-sm font-bold text-white">{indicators.totalAddresses}</p>
                  </div>
                </motion.div>

                {/* Cartões Ativos */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 group cursor-default hidden xl:flex"
                >
                  <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-white/80 leading-tight">Cartões Ativos</p>
                    <p className="text-sm font-bold text-white">{indicators.totalActiveCards}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Status e Última Atualização */}
          <div className="flex items-center gap-4">
            {/* Indicador de Status do Sistema */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-xs text-white/80 hidden sm:inline">Sistema Online</span>
            </div>

            {/* Última Atualização */}
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Clock className="w-3 h-3" />
              <span className="hidden sm:inline">Atualizado há</span>
              <span className="font-semibold text-white">{timeSinceUpdate}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

