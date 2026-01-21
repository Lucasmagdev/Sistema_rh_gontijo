import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2, Users, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location } from '../types/route';
import { Employee } from '../types/employee';
import { getAllEmployees } from '../services/employeeService';
import { addressToLocation } from '../utils/addressToLocation';
import { AddressSearch } from './AddressSearch';

interface RouteInputPanelProps {
  locations: Location[];
  onCalculate: (origin: Location, destination: Location, originEmployeeId?: string, destinationEmployeeId?: string) => void;
  isLoading: boolean;
}

type SelectionType = 'location' | 'employee' | 'address';

export function RouteInputPanel({ locations, onCalculate, isLoading }: RouteInputPanelProps) {
  const [originType, setOriginType] = useState<SelectionType>('location');
  const [destinationType, setDestinationType] = useState<SelectionType>('location');
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [originEmployee, setOriginEmployee] = useState<Employee | null>(null);
  const [destinationEmployee, setDestinationEmployee] = useState<Employee | null>(null);
  const [originAddress, setOriginAddress] = useState<Location | null>(null);
  const [destinationAddress, setDestinationAddress] = useState<Location | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  useEffect(() => {
    const loadEmployees = async () => {
      setIsLoadingEmployees(true);
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []);

  // Cleanup do timeout quando componente desmontar
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Ref para armazenar timeout do debounce
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let originLocation: Location | undefined;
    let destinationLocation: Location | undefined;

    if (originType === 'employee' && originEmployee) {
      const mainAddress = originEmployee.addresses.find(addr => addr.isMain) || originEmployee.addresses[0];
      if (!mainAddress) {
        alert('O colaborador selecionado não possui endereço cadastrado.');
        return;
      }
      originLocation = addressToLocation(mainAddress, originEmployee.name);
    } else if (originType === 'address' && originAddress) {
      originLocation = originAddress;
    } else {
      originLocation = locations.find(l => l.id === origin);
    }

    if (destinationType === 'employee' && destinationEmployee) {
      const mainAddress = destinationEmployee.addresses.find(addr => addr.isMain) || destinationEmployee.addresses[0];
      if (!mainAddress) {
        alert('O colaborador selecionado não possui endereço cadastrado.');
        return;
      }
      destinationLocation = addressToLocation(mainAddress, destinationEmployee.name);
    } else if (destinationType === 'address' && destinationAddress) {
      destinationLocation = destinationAddress;
    } else {
      destinationLocation = locations.find(l => l.id === destination);
    }

    if (originLocation && destinationLocation) {
      // Limpar timeout anterior se existir
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      
      // Debounce: aguardar 800ms após última submissão antes de calcular
      debounceTimeoutRef.current = setTimeout(() => {
        onCalculate(
          originLocation!, 
          destinationLocation!,
          originType === 'employee' && originEmployee ? originEmployee.id : undefined,
          destinationType === 'employee' && destinationEmployee ? destinationEmployee.id : undefined
        );
      }, 800);
    }
  };

  const handleOriginEmployeeChange = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setOriginEmployee(employee || null);
    setOrigin('');
  };

  const handleDestinationEmployeeChange = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setDestinationEmployee(employee || null);
    setDestination('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
      }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Simular Rota</h2>
        <p className="text-sm text-gray-600">Escolha a origem e o destino da sua viagem</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <MapPin className="w-4 h-4 text-[#C4161C]" />
            Origem
          </label>
          
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setOriginType('location');
                setOriginEmployee(null);
                setOriginAddress(null);
                setOrigin('');
              }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                originType === 'location'
                  ? 'bg-[#C4161C] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lista
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginType('address');
                setOriginEmployee(null);
                setOrigin('');
              }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                originType === 'address'
                  ? 'bg-[#C4161C] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-3 h-3 inline mr-1" />
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginType('employee');
                setOriginAddress(null);
                setOrigin('');
              }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                originType === 'employee'
                  ? 'bg-[#C4161C] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3 h-3 inline mr-1" />
              Colaborador
            </button>
          </div>

          {originType === 'location' ? (
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-300 hover:shadow-md"
              required={originType === 'location'}
            >
              <option value="">Selecione a origem...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} - {loc.city}
                </option>
              ))}
            </select>
          ) : originType === 'address' ? (
            <AddressSearch
              value={originAddress?.name || ''}
              onChange={(location) => {
                setOriginAddress(location);
                setOrigin('');
              }}
              placeholder="Digite o endereço de origem (ex: Rua X, 123, Belo Horizonte)"
              required={originType === 'address'}
            />
          ) : (
            <div className="space-y-2">
              <select
                value={originEmployee?.id || ''}
                onChange={(e) => handleOriginEmployeeChange(e.target.value)}
                disabled={isLoadingEmployees}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-300 hover:shadow-md disabled:opacity-50"
                required={originType === 'employee'}
              >
                <option value="">Selecione um colaborador...</option>
                {employees.map((emp) => {
                  const mainAddr = emp.addresses.find(a => a.isMain) || emp.addresses[0];
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {mainAddr ? `${mainAddr.city}, ${mainAddr.state}` : 'Sem endereço'}
                    </option>
                  );
                })}
              </select>
              
              <AnimatePresence>
                {originEmployee && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{originEmployee.name}</p>
                        <p className="text-xs text-gray-600">{originEmployee.position}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setOriginEmployee(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {originEmployee.addresses.find(a => a.isMain) || originEmployee.addresses[0] ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="font-semibold">Endereço Principal:</p>
                        {(() => {
                          const addr = originEmployee.addresses.find(a => a.isMain) || originEmployee.addresses[0];
                          return (
                            <p className="text-xs">
                              {addr.street}, {addr.number}
                              {addr.complement && ` - ${addr.complement}`}
                              <br />
                              {addr.neighborhood} - {addr.city}/{addr.state}
                              <br />
                              CEP: {addr.zipCode}
                            </p>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Colaborador sem endereço cadastrado</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Navigation className="w-4 h-4 text-[#C4161C]" />
            Destino
          </label>
          
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={() => {
                setDestinationType('location');
                setDestinationEmployee(null);
                setDestinationAddress(null);
                setDestination('');
              }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                destinationType === 'location'
                  ? 'bg-[#C4161C] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Lista
            </button>
            <button
              type="button"
              onClick={() => {
                setDestinationType('address');
                setDestinationEmployee(null);
                setDestination('');
              }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                destinationType === 'address'
                  ? 'bg-[#C4161C] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-3 h-3 inline mr-1" />
              Buscar
            </button>
            <button
              type="button"
              onClick={() => {
                setDestinationType('employee');
                setDestinationAddress(null);
                setDestination('');
              }}
              className={`flex-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                destinationType === 'employee'
                  ? 'bg-[#C4161C] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3 h-3 inline mr-1" />
              Colaborador
            </button>
          </div>

          {destinationType === 'location' ? (
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-300 hover:shadow-md"
              required={destinationType === 'location'}
            >
              <option value="">Selecione o destino...</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} - {loc.city}
                </option>
              ))}
            </select>
          ) : destinationType === 'address' ? (
            <AddressSearch
              value={destinationAddress?.name || ''}
              onChange={(location) => {
                setDestinationAddress(location);
                setDestination('');
              }}
              placeholder="Digite o endereço de destino (ex: Rua Y, 456, Belo Horizonte)"
              required={destinationType === 'address'}
            />
          ) : (
            <div className="space-y-2">
              <select
                value={destinationEmployee?.id || ''}
                onChange={(e) => handleDestinationEmployeeChange(e.target.value)}
                disabled={isLoadingEmployees}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-300 hover:shadow-md disabled:opacity-50"
                required={destinationType === 'employee'}
              >
                <option value="">Selecione um colaborador...</option>
                {employees.map((emp) => {
                  const mainAddr = emp.addresses.find(a => a.isMain) || emp.addresses[0];
                  return (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {mainAddr ? `${mainAddr.city}, ${mainAddr.state}` : 'Sem endereço'}
                    </option>
                  );
                })}
              </select>
              
              <AnimatePresence>
                {destinationEmployee && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">{destinationEmployee.name}</p>
                        <p className="text-xs text-gray-600">{destinationEmployee.position}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setDestinationEmployee(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {destinationEmployee.addresses.find(a => a.isMain) || destinationEmployee.addresses[0] ? (
                      <div className="text-sm text-gray-700 space-y-1">
                        <p className="font-semibold">Endereço Principal:</p>
                        {(() => {
                          const addr = destinationEmployee.addresses.find(a => a.isMain) || destinationEmployee.addresses[0];
                          return (
                            <p className="text-xs">
                              {addr.street}, {addr.number}
                              {addr.complement && ` - ${addr.complement}`}
                              <br />
                              {addr.neighborhood} - {addr.city}/{addr.state}
                              <br />
                              CEP: {addr.zipCode}
                            </p>
                          );
                        })()}
                      </div>
                    ) : (
                      <p className="text-xs text-red-600">Colaborador sem endereço cadastrado</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={
            isLoading ||
            (originType === 'location' && !origin) ||
            (originType === 'employee' && !originEmployee) ||
            (originType === 'address' && !originAddress) ||
            (destinationType === 'location' && !destination) ||
            (destinationType === 'employee' && !destinationEmployee) ||
            (destinationType === 'address' && !destinationAddress)
          }
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Calculando rotas...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              Simular Rota
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
