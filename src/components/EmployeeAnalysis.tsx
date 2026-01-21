import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Clock, MapPin, BarChart3, User, Bus } from 'lucide-react';
import { Employee } from '../types/employee';
import { getEmployeeById } from '../services/employeeService';
import { formatFare } from '../services/fareCalculator';

interface EmployeeAnalysisProps {
  employeeId: string;
  onBack: () => void;
}

interface CostSimulation {
  days: number;
  dailyCost: number;
  totalCost: number;
  totalDuration: number; // em minutos
  totalTrips: number;
}

export function EmployeeAnalysis({ employeeId, onBack }: EmployeeAnalysisProps) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [simulationDays, setSimulationDays] = useState(22); // Dias úteis padrão
  const [simulation, setSimulation] = useState<CostSimulation | null>(null);

  useEffect(() => {
    const loadEmployee = async () => {
      setIsLoading(true);
      try {
        const emp = await getEmployeeById(employeeId);
        setEmployee(emp);
        if (emp) {
          calculateSimulation(emp, simulationDays);
        }
      } catch (error) {
        console.error('Error loading employee:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadEmployee();
  }, [employeeId]);

  useEffect(() => {
    if (employee) {
      calculateSimulation(employee, simulationDays);
    }
  }, [simulationDays, employee]);

  const calculateSimulation = (emp: Employee, days: number) => {
    const routeToWork = emp.routeToWork;
    const routeFromWork = emp.routeFromWork;

    if (!routeToWork && !routeFromWork) {
      setSimulation(null);
      return;
    }

    let dailyCost = 0;
    let dailyDuration = 0;

    if (routeToWork?.isActive && routeToWork.route) {
      dailyCost += routeToWork.route.totalCost;
      dailyDuration += routeToWork.route.totalDuration;
    }

    if (routeFromWork?.isActive && routeFromWork.route) {
      dailyCost += routeFromWork.route.totalCost;
      dailyDuration += routeFromWork.route.totalDuration;
    }

    const totalCost = dailyCost * days;
    const totalTrips = (routeToWork && routeFromWork ? 2 : 1) * days;
    const totalDuration = dailyDuration * days;

    setSimulation({
      days,
      dailyCost,
      totalCost,
      totalDuration,
      totalTrips,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C4161C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando análise...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Colaborador não encontrado</p>
        <button onClick={onBack} className="mt-4 text-[#C4161C] hover:underline">
          Voltar
        </button>
      </div>
    );
  }

  const routeToWork = employee.routeToWork;
  const routeFromWork = employee.routeFromWork;
  const hasRoutes = routeToWork || routeFromWork;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </motion.button>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">{employee.name}</h2>
            <p className="text-sm text-gray-600">{employee.position}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
          <User className="w-4 h-4" />
          Análise de Custos
        </div>
      </div>

      {!hasRoutes ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhuma rota atribuída</h3>
          <p className="text-gray-600">
            Atribua rotas de ida e/ou volta ao colaborador para visualizar análises de custos.
          </p>
        </div>
      ) : (
        <>
          {/* Rotas Atribuídas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {routeToWork && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border-2 ${
                  routeToWork.isActive
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">IDA</span>
                    Rota de Ida
                  </h3>
                  {routeToWork.isActive ? (
                    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Ativa</span>
                  ) : (
                    <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">Inativa</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">De:</span> {routeToWork.origin.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Para:</span> {routeToWork.destination.name}
                </p>
                {routeToWork.route && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700">
                      💰 {formatFare(routeToWork.route.totalCost)}
                    </span>
                    <span className="text-gray-700">
                      ⏱️ {Math.round(routeToWork.route.totalDuration / 60)} min
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Atribuída em: {new Date(routeToWork.assignedAt).toLocaleDateString('pt-BR')}
                </p>
              </motion.div>
            )}

            {routeFromWork && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`p-4 rounded-xl border-2 ${
                  routeFromWork.isActive
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">VOLTA</span>
                    Rota de Volta
                  </h3>
                  {routeFromWork.isActive ? (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">Ativa</span>
                  ) : (
                    <span className="text-xs bg-gray-400 text-white px-2 py-1 rounded">Inativa</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  <span className="font-semibold">De:</span> {routeFromWork.origin.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Para:</span> {routeFromWork.destination.name}
                </p>
                {routeFromWork.route && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-700">
                      💰 {formatFare(routeFromWork.route.totalCost)}
                    </span>
                    <span className="text-gray-700">
                      ⏱️ {Math.round(routeFromWork.route.totalDuration / 60)} min
                    </span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Atribuída em: {new Date(routeFromWork.assignedAt).toLocaleDateString('pt-BR')}
                </p>
              </motion.div>
            )}
          </div>

          {/* Simulação de Custos */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-gray-800">Simulação de Custos</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Número de dias úteis:
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="31"
                  value={simulationDays}
                  onChange={(e) => setSimulationDays(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-bold text-gray-800 min-w-[60px] text-right">
                  {simulationDays} {simulationDays === 1 ? 'dia' : 'dias'}
                </span>
              </div>
            </div>

            {simulation && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-xs text-gray-600 font-semibold">Custo Diário</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatFare(simulation.dailyCost)}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <span className="text-xs text-gray-600 font-semibold">Custo Total</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatFare(simulation.totalCost)}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <span className="text-xs text-gray-600 font-semibold">Tempo Total</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {Math.round(simulation.totalDuration / 60)}h {simulation.totalDuration % 60}min
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-purple-200"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Bus className="w-5 h-5 text-purple-600" />
                    <span className="text-xs text-gray-600 font-semibold">Total de Viagens</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{simulation.totalTrips}</p>
                </motion.div>
              </div>
            )}
          </div>

          {/* Resumo */}
          {simulation && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-2">Resumo</h4>
              <p className="text-sm text-gray-700">
                Para {simulation.days} {simulation.days === 1 ? 'dia útil' : 'dias úteis'}, o colaborador{' '}
                <span className="font-bold">{employee.name}</span> terá um custo total de transporte de{' '}
                <span className="font-bold text-[#C4161C]">{formatFare(simulation.totalCost)}</span>, realizando{' '}
                <span className="font-bold">{simulation.totalTrips}</span> viagens e gastando aproximadamente{' '}
                <span className="font-bold">{Math.round(simulation.totalDuration / 60)} horas</span> em transporte.
              </p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

