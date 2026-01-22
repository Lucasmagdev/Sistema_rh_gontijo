import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, User } from 'lucide-react';
import { Route, Location } from '../../types/route';
import { Employee } from '../../types/employee';
import { getAllEmployees } from '../../services/employeeServiceSupabase';
import { assignRouteToEmployee } from '../../services/employeeRouteService';

interface AssignRouteToEmployeeProps {
  route: Route;
  origin: Location;
  destination: Location;
  routeType: 'toWork' | 'fromWork'; // 'toWork' = ida, 'fromWork' = volta
  onSave: () => void;
  onCancel: () => void;
}

export function AssignRouteToEmployee({
  route,
  origin,
  destination,
  routeType,
  onSave,
  onCancel,
}: AssignRouteToEmployeeProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);

  // Carregar colaboradores
  useEffect(() => {
    const loadEmployees = async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEmployeeId) {
      alert('Selecione um colaborador');
      return;
    }

    setIsLoading(true);
    try {
      await assignRouteToEmployee(selectedEmployeeId, route, origin, destination, routeType);
      alert(`Rota ${routeType === 'toWork' ? 'de ida' : 'de volta'} atribuída com sucesso!`);
      onSave();
    } catch (error) {
      console.error('Error assigning route:', error);
      alert('Erro ao atribuir rota ao colaborador');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 max-w-md mx-auto"
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Atribuir Rota {routeType === 'toWork' ? 'de Ida' : 'de Volta'}
        </h3>
        <p className="text-sm text-gray-600">
          {routeType === 'toWork' 
            ? 'Casa → Trabalho' 
            : 'Trabalho → Casa'}
        </p>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-600 mb-1">Origem:</p>
        <p className="text-sm font-semibold text-gray-800">{origin.name}</p>
        <p className="text-xs text-gray-600 mt-2 mb-1">Destino:</p>
        <p className="text-sm font-semibold text-gray-800">{destination.name}</p>
        <p className="text-xs text-gray-500 mt-2">
          Custo: R$ {route.totalCost.toFixed(2)} | Duração: {Math.round(route.totalDuration / 60)} min
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Selecionar Colaborador *
          </label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            disabled={isLoadingEmployees || isLoading}
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all disabled:opacity-50"
            required
          >
            <option value="">Selecione um colaborador...</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} - {emp.position}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading || !selectedEmployeeId}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Atribuir Rota
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

