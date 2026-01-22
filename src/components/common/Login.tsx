import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bus, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { login } from '../../services/auth/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validação básica
      if (!email.trim() || !password.trim()) {
        setError('Por favor, preencha todos os campos');
        setIsLoading(false);
        return;
      }

      // Validação de email básica
      if (!email.includes('@')) {
        setError('Por favor, insira um email válido');
        setIsLoading(false);
        return;
      }

      // Realiza login com validação de credenciais
      await login(email, password);
      
      // Notifica sucesso
      onLoginSuccess();
    } catch (err) {
      // Exibe mensagem de erro específica se disponível
      const errorMessage = err instanceof Error ? err.message : 'Erro ao realizar login. Tente novamente.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card de Login */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header do Card */}
          <div className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-5"></div>
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg mx-auto mb-4"
              >
                <Bus className="w-9 h-9" />
              </motion.div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                TransitRoute RMBH
              </h1>
              <p className="text-white/90 text-sm">
                Sistema de Roteirização e Logística
              </p>
            </div>
          </div>

          {/* Formulário */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Mensagem de Erro */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Botão de Login */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white py-3 px-6 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Entrar</span>
                  </>
                )}
              </motion.button>
            </form>

            {/* Informação temporária - Credenciais fictícias */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-semibold mb-2 text-center">
                Credenciais de Desenvolvimento:
              </p>
              <div className="space-y-1 text-xs text-blue-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Admin:</span>
                  <span className="font-mono">admin@transitroute.com / admin123</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Operador:</span>
                  <span className="font-mono">operador@transitroute.com / operador123</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Gestor:</span>
                  <span className="font-mono">gestor@transitroute.com / gestor123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} TransitRoute RMBH. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

