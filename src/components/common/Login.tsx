import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bus, LogIn, Mail, Lock, AlertCircle, X, HelpCircle } from 'lucide-react';
import { login } from '../../services/auth/authService';
import { showToast } from './Toast';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

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
                SafeRouteHub
              </h1>
              <p className="text-white/90 text-sm">
                Sistema de Gestão de Rotas e Mobilidade
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#C4161C] hover:text-[#8B0F14] font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
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

          </div>
        </div>

        {/* Modal de Esqueceu Senha */}
        <AnimatePresence>
          {showForgotPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowForgotPassword(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C4161C]/10 rounded-lg flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-[#C4161C]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Recuperar Senha</h3>
                      <p className="text-sm text-gray-500">Digite seu email para recuperar</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowForgotPassword(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!forgotPasswordEmail.trim() || !forgotPasswordEmail.includes('@')) {
                      showToast('Por favor, insira um email válido', 'warning');
                      return;
                    }

                    setIsSendingReset(true);
                    // Simulação de envio de email
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    setIsSendingReset(false);
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                    showToast(
                      'Instruções de recuperação de senha foram enviadas para seu email!',
                      'success'
                    );
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        placeholder="seu.email@empresa.com"
                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C4161C] focus:border-[#C4161C] transition-all"
                        disabled={isSendingReset}
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      Enviaremos um link de recuperação para seu email cadastrado.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                      }}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
                      disabled={isSendingReset}
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(196, 22, 28, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-[#C4161C] text-white rounded-lg font-semibold hover:bg-[#8B0F14] transition-all shadow-lg flex items-center justify-center gap-2"
                      disabled={isSendingReset}
                    >
                      {isSendingReset ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Enviar</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} SafeRouteHub. Todos os direitos reservados.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

