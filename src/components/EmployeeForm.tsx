import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2, MapPin, CreditCard } from 'lucide-react';
import { Employee, EmployeeFormData, Address, BusCard } from '../types/employee';
import { createEmployee, updateEmployee } from '../services/employeeService';

interface EmployeeFormProps {
  employee?: Employee;
  onSave: () => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: '',
    document: '',
    position: '',
    department: '',
    addresses: [],
    busCards: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        document: employee.document,
        position: employee.position,
        department: employee.department || '',
        addresses: employee.addresses.map(addr => ({
          id: addr.id,
          street: addr.street,
          number: addr.number,
          complement: addr.complement || '',
          neighborhood: addr.neighborhood,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          lat: addr.lat,
          lng: addr.lng,
          isMain: addr.isMain,
        })),
        busCards: (employee.busCards || []).map(card => ({
          id: card.id,
          cardNumber: card.cardNumber,
          cardType: card.cardType || '',
          isActive: card.isActive,
        })),
      });
    }
  }, [employee]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    if (!formData.document.trim()) newErrors.document = 'Documento é obrigatório';
    if (!formData.position.trim()) newErrors.position = 'Cargo é obrigatório';

    formData.addresses.forEach((addr, index) => {
      if (!addr.street.trim()) newErrors[`address_${index}_street`] = 'Rua é obrigatória';
      if (!addr.number.trim()) newErrors[`address_${index}_number`] = 'Número é obrigatório';
      if (!addr.neighborhood.trim()) newErrors[`address_${index}_neighborhood`] = 'Bairro é obrigatório';
      if (!addr.city.trim()) newErrors[`address_${index}_city`] = 'Cidade é obrigatória';
      if (!addr.state.trim()) newErrors[`address_${index}_state`] = 'Estado é obrigatório';
      if (!addr.zipCode.trim()) newErrors[`address_${index}_zipCode`] = 'CEP é obrigatório';
    });

    if (formData.addresses.length === 0) {
      newErrors.addresses = 'Pelo menos um endereço é obrigatório';
    }

    const mainAddresses = formData.addresses.filter(addr => addr.isMain);
    if (mainAddresses.length === 0) {
      newErrors.addresses = 'Pelo menos um endereço deve ser marcado como principal';
    }
    if (mainAddresses.length > 1) {
      newErrors.addresses = 'Apenas um endereço pode ser marcado como principal';
    }

    // Validar cartões de ônibus
    formData.busCards.forEach((card, index) => {
      if (card.cardNumber && !card.cardNumber.trim()) {
        newErrors[`busCard_${index}_cardNumber`] = 'Número do cartão não pode estar vazio';
      }
      // Validar formato básico do número do cartão (opcional)
      if (card.cardNumber && card.cardNumber.trim().length < 8) {
        newErrors[`busCard_${index}_cardNumber`] = 'Número do cartão deve ter pelo menos 8 dígitos';
      }
    });

    // Validar limite de cartões
    if (formData.busCards.length > 2) {
      newErrors.busCards = 'Máximo de 2 cartões permitidos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (employee) {
        await updateEmployee(employee.id, formData);
      } else {
        await createEmployee(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Erro ao salvar colaborador');
    } finally {
      setIsLoading(false);
    }
  };

  const addAddress = () => {
    setFormData({
      ...formData,
      addresses: [
        ...formData.addresses,
        {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: '',
          isMain: formData.addresses.length === 0,
        },
      ],
    });
  };

  const removeAddress = (index: number) => {
    setFormData({
      ...formData,
      addresses: formData.addresses.filter((_, i) => i !== index),
    });
  };

  const updateAddress = (index: number, field: keyof Address, value: string | number | boolean) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index] = { ...newAddresses[index], [field]: value };
    
    if (field === 'isMain' && value === true) {
      newAddresses.forEach((addr, i) => {
        if (i !== index) addr.isMain = false;
      });
    }
    
    setFormData({ ...formData, addresses: newAddresses });
  };

  const updateField = (field: keyof EmployeeFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  // Funções para gerenciar cartões de ônibus
  const addBusCard = () => {
    if (formData.busCards.length >= 2) {
      alert('Você pode cadastrar no máximo 2 cartões de ônibus.');
      return;
    }
    setFormData({
      ...formData,
      busCards: [
        ...formData.busCards,
        {
          cardNumber: '',
          cardType: '',
          isActive: true,
        },
      ],
    });
  };

  const removeBusCard = (index: number) => {
    setFormData({
      ...formData,
      busCards: formData.busCards.filter((_, i) => i !== index),
    });
  };

  const updateBusCard = (index: number, field: keyof BusCard, value: string | boolean) => {
    const newBusCards = [...formData.busCards];
    newBusCards[index] = { ...newBusCards[index], [field]: value };
    setFormData({ ...formData, busCards: newBusCards });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 border border-white/20 max-w-4xl mx-auto"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {employee ? 'Editar Colaborador' : 'Novo Colaborador'}
        </h2>
        <p className="text-sm text-gray-600">Preencha os dados do colaborador</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all ${
                errors.name ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all ${
                errors.phone ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Documento (CPF/CNPJ) *
            </label>
            <input
              type="text"
              value={formData.document}
              onChange={(e) => updateField('document', e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all ${
                errors.document ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cargo *
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => updateField('position', e.target.value)}
              className={`w-full px-4 py-3 bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all ${
                errors.position ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Departamento
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => updateField('department', e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#C4161C]" />
              <h3 className="text-lg font-bold text-gray-800">Endereços</h3>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addAddress}
              className="bg-[#C4161C]/10 text-[#C4161C] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#C4161C]/20 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar Endereço
            </motion.button>
          </div>

          {errors.addresses && (
            <p className="text-red-500 text-sm mb-4">{errors.addresses}</p>
          )}

          <div className="space-y-4">
            {formData.addresses.map((address, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={address.isMain}
                      onChange={(e) => updateAddress(index, 'isMain', e.target.checked)}
                      className="w-4 h-4 text-[#C4161C] rounded focus:ring-[#C4161C]"
                    />
                    <label className="text-sm font-semibold text-gray-700">
                      Endereço Principal
                    </label>
                  </div>
                  {formData.addresses.length > 1 && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeAddress(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Rua *
                    </label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => updateAddress(index, 'street', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`address_${index}_street`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`address_${index}_street`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_street`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Número *
                    </label>
                    <input
                      type="text"
                      value={address.number}
                      onChange={(e) => updateAddress(index, 'number', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`address_${index}_number`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`address_${index}_number`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_number`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={address.complement}
                      onChange={(e) => updateAddress(index, 'complement', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bairro *
                    </label>
                    <input
                      type="text"
                      value={address.neighborhood}
                      onChange={(e) => updateAddress(index, 'neighborhood', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`address_${index}_neighborhood`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`address_${index}_neighborhood`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_neighborhood`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Cidade *
                    </label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => updateAddress(index, 'city', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`address_${index}_city`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`address_${index}_city`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_city`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => updateAddress(index, 'state', e.target.value)}
                      maxLength={2}
                      placeholder="MG"
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`address_${index}_state`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`address_${index}_state`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_state`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      CEP *
                    </label>
                    <input
                      type="text"
                      value={address.zipCode}
                      onChange={(e) => updateAddress(index, 'zipCode', e.target.value)}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`address_${index}_zipCode`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`address_${index}_zipCode`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`address_${index}_zipCode`]}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Seção de Cartões de Ônibus */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#C4161C]" />
              <h3 className="text-lg font-bold text-gray-800">Cartões de Ônibus</h3>
              <span className="text-xs text-gray-500">(Máximo 2 cartões)</span>
            </div>
            {formData.busCards.length < 2 && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addBusCard}
                className="bg-[#C4161C]/10 text-[#C4161C] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-[#C4161C]/20 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Cartão
              </motion.button>
            )}
          </div>

          <div className="space-y-4">
            {formData.busCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#C4161C]" />
                    <h4 className="text-sm font-semibold text-gray-700">
                      Cartão {index + 1}
                    </h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={card.isActive}
                        onChange={(e) => updateBusCard(index, 'isActive', e.target.checked)}
                        className="w-4 h-4 text-[#C4161C] rounded focus:ring-[#C4161C]"
                      />
                      Ativo
                    </label>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeBusCard(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Número do Cartão *
                    </label>
                    <input
                      type="text"
                      value={card.cardNumber}
                      onChange={(e) => updateBusCard(index, 'cardNumber', e.target.value)}
                      placeholder="Ex: 1234567890123456"
                      maxLength={20}
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] ${
                        errors[`busCard_${index}_cardNumber`] ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                    {errors[`busCard_${index}_cardNumber`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`busCard_${index}_cardNumber`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tipo de Cartão
                    </label>
                    <select
                      value={card.cardType}
                      onChange={(e) => updateBusCard(index, 'cardType', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C]"
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="Bilhete Único">Bilhete Único</option>
                      <option value="Vale Transporte">Vale Transporte</option>
                      <option value="Cartão Estudante">Cartão Estudante</option>
                      <option value="Cartão Idoso">Cartão Idoso</option>
                      <option value="Cartão PCD">Cartão PCD</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            ))}

            {formData.busCards.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum cartão cadastrado</p>
                <p className="text-xs mt-1">Clique em "Adicionar Cartão" para cadastrar</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancelar
          </motion.button>
          <motion.button
            type="submit"
            disabled={isLoading}
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
                Salvar
              </>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

