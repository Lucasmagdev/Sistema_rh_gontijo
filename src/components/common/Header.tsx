import { Bus, Route, Users, LogOut, BarChart3, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  activeTab: 'routes' | 'employees' | 'reports' | 'recharge';
  onTabChange: (tab: 'routes' | 'employees' | 'reports' | 'recharge') => void;
  onLogout?: () => void;
}

export function Header({ activeTab, onTabChange, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-5"></div>
      <div className="container mx-auto px-6 py-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
              <Bus className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TransitRoute RMBH</h1>
              <p className="text-sm text-white/80">Sistema de Simulação de Rotas de Ônibus</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('routes')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'routes'
                    ? 'bg-white text-[#C4161C] shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Route className="w-4 h-4" />
                Rotas
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('employees')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'employees'
                    ? 'bg-white text-[#C4161C] shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4" />
                Colaboradores
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('reports')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'reports'
                    ? 'bg-white text-[#C4161C] shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Relatórios
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange('recharge')}
                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'recharge'
                    ? 'bg-white text-[#C4161C] shadow-lg'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Recarga
              </motion.button>
            </nav>

            {onLogout && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/20"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
