import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Car, MapPin, Users, Edit, Trash2, X, Save, Clock } from 'lucide-react';
import { DriverRoute, DriverRouteFormData, RouteStop, PickupPoint } from '../../types/driverRoute';
import { Employee } from '../../types/employee';
import {
  getAllDriverRoutes,
  createDriverRoute,
  updateDriverRoute,
  deleteDriverRoute,
  calculateCarRoute,
  getAllPickupPoints,
  createPickupPoint,
  DRIVER_ROUTE_COLORS,
} from '../../services/driverRouteServiceSupabase';
import { getAllEmployees } from '../../services/employeeServiceSupabase';
import { DriverRouteMap } from './DriverRouteMap';
import { Location } from '../../types/route';
import { AddressSearch } from '../employees/AddressSearch';
import { showToast } from '../common/Toast';

export function DriverRouteManager() {
  const [driverRoutes, setDriverRoutes] = useState<DriverRoute[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<DriverRoute | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPickupPointFormOpen, setIsPickupPointFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<DriverRouteFormData>>({
    name: '',
    driverId: '',
    origin: undefined,
    destination: undefined,
    stops: [],
    path: [],
    color: DRIVER_ROUTE_COLORS[0],
    capacity: 4,
  });
  const [pickupPointFormData, setPickupPointFormData] = useState<{
    name: string;
    description: string;
    location: Location | null;
    routeIds: string[];
  }>({
    name: '',
    description: '',
    location: null,
    routeIds: [],
  });

  useEffect(() => {
    try {
      loadData();
    } catch (err) {
      console.error('Erro ao inicializar DriverRouteManager:', err);
      setError('Erro ao carregar dados. Verifique o console para mais detalhes.');
      setIsLoading(false);
    }
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('🔄 Carregando dados do UberGon...');
      const [routes, emps, points] = await Promise.all([
        getAllDriverRoutes(),
        getAllEmployees(),
        getAllPickupPoints(),
      ]);
      console.log('✅ Dados carregados:', {
        rotas: routes?.length || 0,
        colaboradores: emps?.length || 0,
        pontos: points?.length || 0,
      });
      setDriverRoutes(routes || []);
      setEmployees(emps || []);
      setPickupPoints(points || []);
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      setError('Erro ao carregar dados. Tente recarregar a página.');
      // Garante que os estados não fiquem undefined
      setDriverRoutes([]);
      setEmployees([]);
      setPickupPoints([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoute = async () => {
    if (!formData.driverId || !formData.name || !formData.origin || !formData.destination) {
      showToast('Preencha todos os campos obrigatórios', 'warning');
      return;
    }

    try {
      // SEMPRE calcular rota real usando Google Directions API (não usar path existente)
      let path: [number, number][] = [];
      
      if (formData.origin && formData.destination) {
        // Mostrar loading enquanto calcula a rota
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2';
        loadingMessage.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div><span>Calculando rota real...</span>';
        document.body.appendChild(loadingMessage);

        try {
          path = await calculateCarRoute(
            formData.origin, 
            formData.destination,
            formData.stops // Passar paradas para cálculo
          );
          loadingMessage.remove();
          
          if (path.length <= 2) {
            console.warn('Rota calculada tem poucos pontos. Pode estar incorreta.');
          }
        } catch (error) {
          loadingMessage.remove();
          console.error('Erro ao calcular rota:', error);
          showToast('Erro ao calcular rota. Usando linha reta como fallback.', 'warning');
          // Fallback: linha reta se a API falhar
          path = [
            [formData.origin.lat, formData.origin.lng],
            [formData.destination.lat, formData.destination.lng],
          ];
        }
      }

      console.log('💾 Salvando nova rota...');
      const newRoute = await createDriverRoute({
        driverId: formData.driverId,
        name: formData.name,
        origin: formData.origin!,
        destination: formData.destination!,
        stops: formData.stops || [],
        path: path as [number, number][],
        color: formData.color || DRIVER_ROUTE_COLORS[0],
        capacity: formData.capacity || 4,
      });

      console.log('✅ Rota salva:', newRoute.id);
      setIsFormOpen(false);
      resetForm();
      
      // Recarregar dados para atualizar a lista e o mapa
      console.log('🔄 Recarregando dados após salvar...');
      await loadData();
      console.log('✅ Dados recarregados');
      showToast('Rota criada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar rota:', error);
      showToast('Erro ao criar rota. Tente novamente.', 'error');
    }
  };

  const handleUpdateRoute = async () => {
    if (!selectedRoute) return;

    try {
      // Se origem ou destino mudaram, recalcular a rota
      let path = formData.path || selectedRoute.path;
      const originChanged = formData.origin && (
        formData.origin.lat !== selectedRoute.origin.lat ||
        formData.origin.lng !== selectedRoute.origin.lng
      );
      const destinationChanged = formData.destination && (
        formData.destination.lat !== selectedRoute.destination.lat ||
        formData.destination.lng !== selectedRoute.destination.lng
      );

      if ((originChanged || destinationChanged) && formData.origin && formData.destination) {
        const loadingMessage = document.createElement('div');
        loadingMessage.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        loadingMessage.textContent = 'Recalculando rota...';
        document.body.appendChild(loadingMessage);

        try {
          path = await calculateCarRoute(formData.origin, formData.destination);
          loadingMessage.remove();
        } catch (error) {
          loadingMessage.remove();
          console.error('Erro ao recalcular rota:', error);
          // Manter rota anterior se falhar
        }
      }

      await updateDriverRoute(selectedRoute.id, {
        ...formData,
        path: path as [number, number][],
      });
      await loadData();
      setIsFormOpen(false);
      setSelectedRoute(null);
      resetForm();
      showToast('Rota atualizada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
      showToast('Erro ao atualizar rota. Tente novamente.', 'error');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    const route = driverRoutes.find(r => r.id === id);
    const routeName = route?.name || 'esta rota';
    
    if (!window.confirm(`Tem certeza que deseja excluir a rota "${routeName}"?\n\nEsta ação não pode ser desfeita.`)) return;

    try {
      await deleteDriverRoute(id);
      await loadData();
      if (selectedRoute?.id === id) {
        setSelectedRoute(null);
      }
      showToast(`Rota "${routeName}" excluída com sucesso!`, 'success');
    } catch (error) {
      console.error('Erro ao excluir rota:', error);
      showToast('Erro ao excluir rota. Tente novamente.', 'error');
    }
  };

  const handleEditRoute = (route: DriverRoute) => {
    setSelectedRoute(route);
    setFormData({
      driverId: route.driverId,
      name: route.name,
      origin: route.origin,
      destination: route.destination,
      stops: route.stops || [],
      path: route.path,
      color: route.color,
      capacity: route.capacity,
      schedule: route.schedule,
    });
    setIsFormOpen(true);
  };

  const handleNewRoute = () => {
    setSelectedRoute(null);
    resetForm();
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      driverId: '',
      origin: undefined,
      destination: undefined,
      stops: [],
      path: [],
      color: DRIVER_ROUTE_COLORS[0],
      capacity: 4,
    });
  };

  const handleAddStop = async () => {
    const newStop: RouteStop = {
      id: `stop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      location: { id: '', name: '', city: '', lat: 0, lng: 0 },
      name: '',
      order: (formData.stops?.length || 0),
      isPickupPoint: false,
    };
    const updatedStops = [...(formData.stops || []), newStop];
    setFormData({
      ...formData,
      stops: updatedStops,
    });
    
    // Recalcular rota se origem e destino estiverem definidos
    if (formData.origin && formData.destination) {
      try {
        const newPath = await calculateCarRoute(formData.origin, formData.destination, updatedStops);
        setFormData(prev => ({ ...prev, path: newPath }));
      } catch (err) {
        console.error('Erro ao recalcular rota com paradas:', err);
      }
    }
  };

  const handleRemoveStop = async (stopId: string) => {
    const updatedStops = (formData.stops || []).filter(s => s.id !== stopId).map((s, index) => ({
      ...s,
      order: index,
    }));
    setFormData({
      ...formData,
      stops: updatedStops,
    });
    
    // Recalcular rota se origem e destino estiverem definidos
    if (formData.origin && formData.destination) {
      try {
        const newPath = await calculateCarRoute(formData.origin, formData.destination, updatedStops);
        setFormData(prev => ({ ...prev, path: newPath }));
      } catch (err) {
        console.error('Erro ao recalcular rota sem parada:', err);
      }
    }
  };

  const handleStopChange = async (stopId: string, field: keyof RouteStop, value: any) => {
    const updatedStops = (formData.stops || []).map(s =>
      s.id === stopId ? { ...s, [field]: value } : s
    );
    setFormData({
      ...formData,
      stops: updatedStops,
    });
    
    // Se a localização da parada mudou, recalcular rota
    if (field === 'location' && formData.origin && formData.destination) {
      try {
        const newPath = await calculateCarRoute(formData.origin, formData.destination, updatedStops);
        setFormData(prev => ({ ...prev, path: newPath }));
      } catch (err) {
        console.error('Erro ao recalcular rota com parada atualizada:', err);
      }
    }
  };

  const handleCreatePickupPoint = async () => {
    if (!pickupPointFormData.location || !pickupPointFormData.name) {
      showToast('Preencha nome e localização do ponto de embarque', 'warning');
      return;
    }

    try {
      await createPickupPoint(
        pickupPointFormData.location,
        pickupPointFormData.name,
        pickupPointFormData.description,
        pickupPointFormData.routeIds
      );
      await loadData();
      setIsPickupPointFormOpen(false);
      setPickupPointFormData({
        name: '',
        description: '',
        location: null,
        routeIds: [],
      });
      showToast('Ponto de embarque criado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao criar ponto de embarque:', error);
      showToast('Erro ao criar ponto de embarque. Tente novamente.', 'error');
    }
  };

  const handleOriginChange = (location: Location | null) => {
    setFormData({ ...formData, origin: location || undefined });
  };

  const handleDestinationChange = (location: Location | null) => {
    setFormData({ ...formData, destination: location || undefined });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
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
          <p className="text-gray-600 font-medium">Carregando rotas...</p>
          <p className="text-sm text-gray-400 mt-2">Aguarde um momento</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-xl p-6 shadow-lg max-w-md border-2 border-red-100"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-red-600 font-bold text-lg mb-2">Erro ao carregar</p>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadData}
            className="px-6 py-3 bg-[#C4161C] text-white rounded-lg font-semibold hover:bg-[#8B0F14] transition-colors shadow-md"
          >
            Tentar Novamente
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-200px)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 mb-4 shadow-md border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C4161C] to-[#8B0F14] rounded-lg flex items-center justify-center shadow-md">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">UberGon</h2>
            </div>
            <p className="text-sm text-gray-500 ml-13">Gerenciamento de Rotas de Caronas</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(196, 22, 28, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPickupPointFormOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-700 transition-all shadow-md"
            >
              <MapPin className="w-4 h-4" />
              Novo Ponto
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(196, 22, 28, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewRoute}
              className="px-5 py-2.5 bg-[#C4161C] text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-[#8B0F14] transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nova Rota
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Conteúdo principal */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {/* Lista de rotas */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)]">
          <AnimatePresence mode="wait">
            {driverRoutes.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl p-8 text-center shadow-sm border-2 border-dashed border-gray-200"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                </motion.div>
                <p className="text-gray-700 font-bold text-lg mb-2">Nenhuma rota cadastrada</p>
                <p className="text-sm text-gray-500 mb-4">Comece criando sua primeira rota de carona</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewRoute}
                  className="px-4 py-2 bg-[#C4161C] text-white rounded-lg font-semibold hover:bg-[#8B0F14] transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Criar Primeira Rota
                </motion.button>
              </motion.div>
            ) : (
              driverRoutes.map((route) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`bg-white rounded-xl p-4 shadow-sm border-2 transition-all duration-200 cursor-pointer group ${
                    selectedRoute?.id === route.id
                      ? 'border-[#C4161C] shadow-lg scale-[1.02]'
                      : 'border-transparent hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedRoute(route)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{route.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">
                          {route.origin.name} → {route.destination.name}
                        </span>
                      </div>
                      {route.stops && route.stops.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-semibold text-gray-600 mb-1">Paradas:</p>
                          <div className="space-y-0.5">
                            {route.stops
                              .sort((a, b) => a.order - b.order)
                              .slice(0, 2)
                              .map((stop) => (
                                <p key={stop.id} className="text-xs text-gray-500">
                                  • {stop.name || stop.location.name}
                                  {stop.time && <span className="ml-1 text-gray-400">({stop.time})</span>}
                                </p>
                              ))}
                            {route.stops.length > 2 && (
                              <p className="text-xs text-gray-400 italic">
                                +{route.stops.length - 2} parada(s) mais
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Car className="w-3 h-3" />
                          <span>{route.driver?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>
                            {route.currentPassengers.length}/{route.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full ml-2 flex-shrink-0"
                      style={{ backgroundColor: route.color }}
                    />
                  </div>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRoute(route);
                      }}
                      className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Editar
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (route.origin && route.destination) {
                          showToast('Recalculando rota...', 'info', 0);
                          
                          try {
                            const newPath = await calculateCarRoute(
                              route.origin, 
                              route.destination,
                              route.stops // Incluir paradas no recálculo
                            );
                            await updateDriverRoute(route.id, { path: newPath });
                            await loadData();
                            showToast('Rota recalculada com sucesso!', 'success');
                          } catch (error) {
                            console.error('Erro ao recalcular rota:', error);
                            showToast('Erro ao recalcular rota. Verifique o console.', 'error');
                          }
                        }
                      }}
                      className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                      title="Recalcular rota usando estradas reais"
                    >
                      <MapPin className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRoute(route.id);
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                      title="Excluir rota"
                    >
                      <Trash2 className="w-3 h-3" />
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          <DriverRouteMap
            driverRoutes={driverRoutes}
            pickupPoints={pickupPoints}
            selectedRouteId={selectedRoute?.id}
            onRouteClick={setSelectedRoute}
          />
        </div>
      </div>

      {/* Modal de formulário */}
      <AnimatePresence mode="wait">
        {isFormOpen && (
          <motion.div
            key="route-form-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    {selectedRoute ? 'Editar Rota' : 'Nova Rota de Motorista'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedRoute ? 'Atualize as informações da rota' : 'Preencha os dados para criar uma nova rota'}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Fechar formulário"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {/* Nome da rota */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nome da Rota *
                  </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-[#C4161C] transition-all"
                      placeholder="Ex: Rota Centro - Pampulha"
                    />
                </div>

                {/* Motorista */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Motorista *
                  </label>
                  <select
                    value={formData.driverId || ''}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-[#C4161C] transition-all bg-white"
                  >
                    <option value="">Selecione um motorista</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Origem */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Origem *
                  </label>
                  <AddressSearch
                    value={formData.origin?.name || ''}
                    onChange={handleOriginChange}
                    placeholder="Digite o endereço de origem"
                  />
                </div>

                {/* Destino */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Destino *
                  </label>
                  <AddressSearch
                    value={formData.destination?.name || ''}
                    onChange={handleDestinationChange}
                    placeholder="Digite o endereço de destino"
                  />
                </div>

                {/* Paradas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Paradas na Rota
                    </label>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleAddStop}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all shadow-sm hover:shadow-md flex items-center gap-1 font-semibold"
                    >
                      <Users className="w-3 h-3" />
                      <Plus className="w-3 h-3" />
                      Adicionar Parada
                    </motion.button>
                  </div>
                  <div className="space-y-2">
                    {formData.stops && formData.stops.length > 0 ? (
                      formData.stops
                        .sort((a, b) => a.order - b.order)
                        .map((stop, index) => (
                          <motion.div 
                            key={stop.id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex gap-2 items-start p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                          >
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-600 bg-blue-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                  <Users className="w-3.5 h-3.5" />
                                  Parada {index + 1}
                                </span>
                                <input
                                  type="text"
                                  value={stop.name}
                                  onChange={(e) => handleStopChange(stop.id, 'name', e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-[#C4161C] transition-all"
                                  placeholder="Nome da parada"
                                />
                                <div className="relative">
                                  <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="time"
                                    value={stop.time || ''}
                                    onChange={(e) => handleStopChange(stop.id, 'time', e.target.value)}
                                    className="pl-8 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-[#C4161C] transition-all w-36"
                                    placeholder="Horário"
                                    title="Horário da parada"
                                  />
                                </div>
                              </div>
                              <AddressSearch
                                value={stop.location?.name || ''}
                                onChange={(location) => handleStopChange(stop.id, 'location', location || { id: '', name: '', city: '', lat: 0, lng: 0 })}
                                placeholder="Localização da parada"
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              type="button"
                              onClick={() => handleRemoveStop(stop.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm hover:shadow-md"
                              title="Remover parada"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-2">
                        Nenhuma parada adicionada. Clique em "Adicionar Parada" para incluir.
                      </p>
                    )}
                  </div>
                </div>

                {/* Capacidade */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Capacidade de Passageiros
                  </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.capacity || 4}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 4 })}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-[#C4161C] transition-all"
                    />
                </div>

                {/* Cor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cor da Rota
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {DRIVER_ROUTE_COLORS.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-12 h-12 rounded-lg border-2 transition-all shadow-md ${
                          formData.color === color
                            ? 'border-gray-800 scale-110 ring-2 ring-offset-2 ring-gray-400'
                            : 'border-gray-300 hover:border-gray-500 hover:shadow-lg'
                        }`}
                        style={{ backgroundColor: color }}
                        title={`Cor: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(196, 22, 28, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={selectedRoute ? handleUpdateRoute : handleCreateRoute}
                  className="flex-1 px-4 py-3 bg-[#C4161C] text-white rounded-lg font-semibold hover:bg-[#8B0F14] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {selectedRoute ? 'Atualizar' : 'Criar'} Rota
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ponto de Embarque */}
      <AnimatePresence mode="wait">
          {isPickupPointFormOpen && (
            <motion.div
              key="pickup-point-form-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setIsPickupPointFormOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-800">Novo Ponto de Embarque</h3>
                  <button
                    onClick={() => setIsPickupPointFormOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nome do ponto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nome do Ponto *
                    </label>
                    <input
                      type="text"
                      value={pickupPointFormData.name}
                      onChange={(e) => setPickupPointFormData({ ...pickupPointFormData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent"
                      placeholder="Ex: Ponto Shopping"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição (opcional)
                    </label>
                    <textarea
                      value={pickupPointFormData.description}
                      onChange={(e) => setPickupPointFormData({ ...pickupPointFormData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent"
                      placeholder="Descrição do ponto de embarque"
                      rows={2}
                    />
                  </div>

                  {/* Localização */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Localização *
                    </label>
                    <AddressSearch
                      value={pickupPointFormData.location?.name || ''}
                      onChange={(location) => setPickupPointFormData({ ...pickupPointFormData, location })}
                      placeholder="Digite o endereço do ponto"
                    />
                  </div>

                  {/* Rotas que passam por este ponto */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Rotas que passam por este ponto
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {driverRoutes.map((route) => (
                        <label key={route.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                          <input
                            type="checkbox"
                            checked={pickupPointFormData.routeIds.includes(route.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPickupPointFormData({
                                  ...pickupPointFormData,
                                  routeIds: [...pickupPointFormData.routeIds, route.id],
                                });
                              } else {
                                setPickupPointFormData({
                                  ...pickupPointFormData,
                                  routeIds: pickupPointFormData.routeIds.filter(id => id !== route.id),
                                });
                              }
                            }}
                            className="rounded border-gray-300 text-[#C4161C] focus:ring-[#C4161C]"
                          />
                          <span className="text-sm text-gray-700">{route.name}</span>
                        </label>
                      ))}
                      {driverRoutes.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          Nenhuma rota cadastrada
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsPickupPointFormOpen(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(34, 197, 94, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreatePickupPoint}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Criar Ponto
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

