import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Employee } from '../../types/employee';
import { getAllEmployees, deleteEmployee } from '../../services/employeeServiceSupabase';

interface EmployeeListProps {
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onAnalyze?: (employee: Employee) => void;
  onNew: () => void;
  refreshTrigger?: number;
}

export function EmployeeList({ onView, onEdit, onAnalyze, onNew, refreshTrigger }: EmployeeListProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Carregando colaboradores...');
      const data = await getAllEmployees();
      console.log('✅ Colaboradores carregados:', data.length);
      setEmployees(data);
    } catch (error) {
      console.error('❌ Erro ao carregar colaboradores:', error);
      alert('Erro ao carregar colaboradores. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este colaborador?')) {
      try {
        await deleteEmployee(id);
        loadEmployees();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Erro ao excluir colaborador');
      }
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#C4161C] to-[#8B0F14] rounded-xl shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Colaboradores</h2>
              <p className="text-sm text-gray-600">{employees.length} cadastrados</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNew}
            className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Novo Colaborador
          </motion.button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-300"
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#C4161C] border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-12 text-center border border-white/20"
        >
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {searchTerm ? 'Nenhum colaborador encontrado' : 'Nenhum colaborador cadastrado'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee, index) => (
            <motion.div
              key={employee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
                {employee.department && (
                  <p className="text-xs text-gray-500 mt-1">{employee.department}</p>
                )}
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span> {employee.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Telefone:</span> {employee.phone}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Endereços:</span> {employee.addresses.length}
                </p>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onView(employee)}
                  className="flex-1 bg-blue-500/10 text-blue-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </motion.button>
                {onAnalyze && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAnalyze(employee)}
                    className="flex-1 bg-purple-500/10 text-purple-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analisar
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(employee)}
                  className="flex-1 bg-[#C4161C]/10 text-[#C4161C] py-2 px-3 rounded-lg font-semibold text-sm hover:bg-[#C4161C]/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(employee.id)}
                  className="bg-red-500/10 text-red-600 py-2 px-3 rounded-lg font-semibold text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

