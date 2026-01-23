import { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Login } from './components/common/Login';
import { RouteInputPanel } from './components/routes/RouteInputPanel';
import { RouteCard } from './components/routes/RouteCard';
import { MapView } from './components/routes/MapView';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/employees/EmployeeForm';
import { EmployeeView } from './components/employees/EmployeeView';
import { EmployeeAnalysis } from './components/employees/EmployeeAnalysis';
import { AssignRouteToEmployee } from './components/routes/AssignRouteToEmployee';
import { ReportsDashboard } from './components/reports/ReportsDashboard';
import { RechargeCalculation } from './components/reports/RechargeCalculation';
import { StatusBar } from './components/StatusBar';
import { DriverRouteManager } from './components/ubergon/DriverRouteManager';
import { ToastContainer } from './components/common/Toast';
import { locations } from './data/locations';
import { calculateRoutes } from './services/routes/routeService';
import { getEmployeeSavedRoute } from './services/employeeRouteService';
import { getAllEmployees } from './services/employeeServiceSupabase';
import { isAuthenticated, logout as authLogout } from './services/auth/authService';
import { Route, Location } from './types/route';
import { Employee } from './types/employee';

type ActiveTab = 'routes' | 'employees' | 'reports' | 'recharge' | 'ubergon';
type EmployeeViewMode = 'list' | 'form' | 'view' | 'analysis';

// Error Boundary para capturar erros de renderização
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] p-4">
          <div className="text-center bg-white rounded-xl p-6 shadow-sm max-w-md">
            <p className="text-red-600 font-semibold mb-2">Erro ao renderizar UberGon</p>
            <p className="text-gray-600 text-sm mb-4">
              {this.state.error?.message || 'Erro desconhecido'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#C4161C] text-white rounded-lg font-semibold hover:bg-[#8B0F14] transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('routes');
  const [employeeViewMode, setEmployeeViewMode] = useState<EmployeeViewMode>('list');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>();
  const [employeeListRefresh, setEmployeeListRefresh] = useState(0);

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | undefined>();
  const [origin, setOrigin] = useState<Location | undefined>();
  const [destination, setDestination] = useState<Location | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignRouteModal, setShowAssignRouteModal] = useState(false);
  const [assignRouteType, setAssignRouteType] = useState<'toWork' | 'fromWork' | null>(null);

  // Verifica autenticação ao montar o componente
  useEffect(() => {
    const checkAuth = () => {
      const auth = isAuthenticated();
      setAuthenticated(auth);
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

  // Handler para sucesso do login
  const handleLoginSuccess = () => {
    setAuthenticated(true);
  };

  // Handler para logout
  const handleLogout = () => {
    authLogout();
    setAuthenticated(false);
    // Limpa estados do sistema ao fazer logout
    setRoutes([]);
    setSelectedRoute(undefined);
    setOrigin(undefined);
    setDestination(undefined);
    setActiveTab('routes');
    setEmployeeViewMode('list');
    setSelectedEmployee(undefined);
  };

  const handleCalculateRoutes = async (originLoc: Location, destinationLoc: Location, originEmployeeId?: string, destinationEmployeeId?: string) => {
    // Validar se origem e destino são diferentes
    if (
      Math.abs(originLoc.lat - destinationLoc.lat) < 0.0001 &&
      Math.abs(originLoc.lng - destinationLoc.lng) < 0.0001
    ) {
      alert('Origem e destino não podem ser o mesmo local.');
      return;
    }

    setIsLoading(true);
    setOrigin(originLoc);
    setDestination(destinationLoc);
    setRoutes([]);
    setSelectedRoute(undefined);

    try {
      // Verificar se algum colaborador já tem rota salva para esta origem/destino
      let savedRoute: Route | null = null;
      
      if (originEmployeeId) {
        const employees = await getAllEmployees();
        const employee = employees.find(emp => emp.id === originEmployeeId);
        if (employee) {
          savedRoute = getEmployeeSavedRoute(employee, {
            origin: originLoc,
            destination: destinationLoc,
          });
        }
      }
      
      if (!savedRoute && destinationEmployeeId) {
        const employees = await getAllEmployees();
        const employee = employees.find(emp => emp.id === destinationEmployeeId);
        if (employee) {
          savedRoute = getEmployeeSavedRoute(employee, {
            origin: originLoc,
            destination: destinationLoc,
          });
        }
      }

      // Se encontrou rota salva, usar ela; senão, calcular nova
      if (savedRoute) {
        setRoutes([savedRoute]);
        setSelectedRoute(savedRoute);
      } else {
        const calculatedRoutes = await calculateRoutes({
          origin: originLoc,
          destination: destinationLoc,
        });
        setRoutes(calculatedRoutes);
        if (calculatedRoutes.length > 0) {
          setSelectedRoute(calculatedRoutes[0]);
        }
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
      // Não mostrar erro ao usuário se for erro de cache (já foi logado)
      if (error instanceof Error && !error.message.includes('cache')) {
        alert('Erro ao calcular rotas. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmployeeView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeViewMode('view');
  };

  const handleEmployeeEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeViewMode('form');
  };

  const handleEmployeeNew = () => {
    setSelectedEmployee(undefined);
    setEmployeeViewMode('form');
  };

  const handleEmployeeSave = () => {
    setEmployeeViewMode('list');
    setSelectedEmployee(undefined);
    setEmployeeListRefresh(prev => prev + 1);
  };

  const handleEmployeeCancel = () => {
    setEmployeeViewMode('list');
    setSelectedEmployee(undefined);
  };

  const handleEmployeeBack = () => {
    setEmployeeViewMode('list');
    setSelectedEmployee(undefined);
  };

  const handleEmployeeAnalyze = (employee: Employee) => {
    setSelectedEmployee(employee);
    setEmployeeViewMode('analysis');
  };

  const handleAssignRoute = (routeType: 'toWork' | 'fromWork') => {
    if (!selectedRoute || !origin || !destination) {
      alert('Selecione uma rota primeiro');
      return;
    }
    setAssignRouteType(routeType);
    setShowAssignRouteModal(true);
  };

  const handleAssignRouteSave = () => {
    setShowAssignRouteModal(false);
    setAssignRouteType(null);
    setEmployeeListRefresh(prev => prev + 1);
  };

  const handleAssignRouteCancel = () => {
    setShowAssignRouteModal(false);
    setAssignRouteType(null);
  };

  // Exibe loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C4161C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Exibe tela de login se não autenticado
  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Renderiza sistema principal se autenticado
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <Header activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      <StatusBar refreshTrigger={employeeListRefresh} />
      <ToastContainer />

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-120px)]">
        <AnimatePresence mode="wait">
          {activeTab === 'recharge' ? (
            <motion.div
              key="recharge"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="overflow-y-auto"
            >
              <RechargeCalculation />
            </motion.div>
          ) : activeTab === 'reports' ? (
            <motion.div
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="overflow-y-auto"
            >
              <ReportsDashboard />
            </motion.div>
          ) : activeTab === 'routes' ? (
            <motion.div
              key="routes"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full"
            >
              <div className="lg:col-span-3 space-y-6 overflow-y-auto max-h-full">
                <RouteInputPanel
                  locations={locations}
                  onCalculate={handleCalculateRoutes}
                  isLoading={isLoading}
                />

                <AnimatePresence>
                  {routes.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Rotas Encontradas</h3>
                        <p className="text-sm text-gray-600">{routes.length} opções disponíveis</p>
                      </div>

                      {routes.map((route) => (
                        <RouteCard
                          key={route.id}
                          route={route}
                          onSelect={() => setSelectedRoute(route)}
                          isSelected={selectedRoute?.id === route.id}
                          onAssignToEmployee={handleAssignRoute}
                          showAssignButton={true}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="lg:col-span-9 h-full">
                <MapView
                  origin={origin}
                  destination={destination}
                  selectedRoute={selectedRoute}
                />
              </div>
            </motion.div>
          ) : activeTab === 'ubergon' ? (
            <motion.div
              key="ubergon"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto min-h-[calc(100vh-200px)] w-full"
            >
              <ErrorBoundary>
                <DriverRouteManager />
              </ErrorBoundary>
            </motion.div>
          ) : (
            <motion.div
              key="employees"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              {employeeViewMode === 'list' && (
                <EmployeeList
                  onView={handleEmployeeView}
                  onEdit={handleEmployeeEdit}
                  onAnalyze={handleEmployeeAnalyze}
                  onNew={handleEmployeeNew}
                  refreshTrigger={employeeListRefresh}
                />
              )}
              {employeeViewMode === 'form' && (
                <EmployeeForm
                  employee={selectedEmployee}
                  onSave={handleEmployeeSave}
                  onCancel={handleEmployeeCancel}
                />
              )}
              {employeeViewMode === 'view' && selectedEmployee && (
                <EmployeeView
                  employee={selectedEmployee}
                  onBack={handleEmployeeBack}
                  onEdit={() => handleEmployeeEdit(selectedEmployee)}
                  onAnalyze={() => handleEmployeeAnalyze(selectedEmployee)}
                />
              )}
              {employeeViewMode === 'analysis' && selectedEmployee && (
                <EmployeeAnalysis
                  employeeId={selectedEmployee.id}
                  onBack={handleEmployeeBack}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Atribuição de Rota */}
      <AnimatePresence>
        {showAssignRouteModal && selectedRoute && origin && destination && assignRouteType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleAssignRouteCancel}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AssignRouteToEmployee
                route={selectedRoute}
                origin={origin}
                destination={destination}
                routeType={assignRouteType}
                onSave={handleAssignRouteSave}
                onCancel={handleAssignRouteCancel}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
