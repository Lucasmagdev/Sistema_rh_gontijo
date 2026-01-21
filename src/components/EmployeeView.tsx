import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Mail, Phone, FileText, Briefcase, Star, CreditCard, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import { Employee } from '../types/employee';

interface EmployeeViewProps {
  employee: Employee;
  onBack: () => void;
  onEdit: () => void;
  onAnalyze?: () => void;
}

export function EmployeeView({ employee, onBack, onEdit, onAnalyze }: EmployeeViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between mb-6">
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </motion.button>
        <div className="flex gap-3">
          {onAnalyze && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAnalyze}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              Análise
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEdit}
            className="bg-gradient-to-r from-[#C4161C] to-[#8B0F14] text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Editar
          </motion.button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{employee.name}</h2>
        <p className="text-lg text-gray-600">{employee.position}</p>
        {employee.department && (
          <p className="text-sm text-gray-500 mt-1">{employee.department}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Email</p>
              <p className="text-sm text-gray-800">{employee.email}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-4 border border-green-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Telefone</p>
              <p className="text-sm text-gray-800">{employee.phone}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Documento</p>
              <p className="text-sm text-gray-800">{employee.document}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-500/20 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold">Cargo</p>
              <p className="text-sm text-gray-800">{employee.position}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-[#C4161C]" />
          <h3 className="text-lg font-bold text-gray-800">Endereços</h3>
          <span className="text-sm text-gray-600">({employee.addresses.length})</span>
        </div>

        <div className="space-y-4">
          {employee.addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gray-50 rounded-xl p-4 border-2 ${
                address.isMain
                  ? 'border-[#C4161C] bg-gradient-to-br from-red-50/50 to-white'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {address.isMain && (
                    <div className="flex items-center gap-1 bg-[#C4161C] text-white px-2 py-1 rounded-full text-xs font-bold">
                      <Star className="w-3 h-3" />
                      Principal
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-800">
                    Endereço {index + 1}
                  </h4>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Logradouro:</span>{' '}
                  {address.street}, {address.number}
                  {address.complement && ` - ${address.complement}`}
                </p>
                <p>
                  <span className="font-semibold">Bairro:</span> {address.neighborhood}
                </p>
                <p>
                  <span className="font-semibold">Cidade:</span> {address.city} - {address.state}
                </p>
                <p>
                  <span className="font-semibold">CEP:</span> {address.zipCode}
                </p>
                {address.lat && address.lng && (
                  <p className="text-xs text-gray-500 mt-2">
                    Coordenadas: {address.lat.toFixed(6)}, {address.lng.toFixed(6)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Seção de Cartões de Ônibus */}
      {(employee.busCards && employee.busCards.length > 0) && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-[#C4161C]" />
            <h3 className="text-lg font-bold text-gray-800">Cartões de Ônibus</h3>
            <span className="text-sm text-gray-600">({employee.busCards.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employee.busCards.map((card, index) => (
              <motion.div
                key={card.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br rounded-xl p-4 border-2 ${
                  card.isActive
                    ? 'from-green-50 to-emerald-50 border-green-300'
                    : 'from-gray-50 to-gray-100 border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-5 h-5 ${card.isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-gray-800">
                      Cartão {index + 1}
                    </h4>
                  </div>
                  {card.isActive ? (
                    <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3" />
                      Ativo
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">
                      <XCircle className="w-3 h-3" />
                      Inativo
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Número:</span>
                    <p className="text-gray-800 font-mono bg-white/50 px-2 py-1 rounded mt-1">
                      {card.cardNumber || 'Não informado'}
                    </p>
                  </div>
                  {card.cardType && (
                    <div>
                      <span className="font-semibold text-gray-700">Tipo:</span>
                      <p className="text-gray-800">{card.cardType}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
        <p>
          Criado em: {new Date(employee.createdAt).toLocaleString('pt-BR')}
        </p>
        {employee.updatedAt !== employee.createdAt && (
          <p>
            Atualizado em: {new Date(employee.updatedAt).toLocaleString('pt-BR')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

