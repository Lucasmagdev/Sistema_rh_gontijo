import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { RouteInputPanel } from './components/RouteInputPanel';
import { RouteCard } from './components/RouteCard';
import { MapView } from './components/MapView';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeView } from './components/EmployeeView';
import { ReportsDashboard } from './components/ReportsDashboard';
import { locations } from './data/locations';
import { calculateRoutes } from './services/routeService';
import { isAuthenticated, logout as authLogout } from './services/authService';
import { Route, Location } from './types/route';
import { Employee } from './types/employee';

type ActiveTab = 'routes' | 'employees' | 'reports';
type EmployeeViewMode = 'list' | 'form' | 'view';

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

  const handleCalculateRoutes = async (originLoc: Location, destinationLoc: Location) => {
    setIsLoading(true);
    setOrigin(originLoc);
    setDestination(destinationLoc);
    setRoutes([]);
    setSelectedRoute(undefined);

    try {
      const calculatedRoutes = await calculateRoutes({
        origin: originLoc,
        destination: destinationLoc,
      });
      setRoutes(calculatedRoutes);
      if (calculatedRoutes.length > 0) {
        setSelectedRoute(calculatedRoutes[0]);
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
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

      <div className="container mx-auto px-4 py-6 h-[calc(100vh-88px)]">
        <AnimatePresence mode="wait">
          {activeTab === 'reports' ? (
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
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
