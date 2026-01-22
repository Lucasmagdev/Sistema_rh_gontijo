import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { geocodeAddress, searchAddressSuggestions, getPlaceDetails, type GeocodingResult } from '../../services/routes/geocodingService';
import { Location } from '../../types/route';

interface AddressSearchProps {
  value: string;
  onChange: (location: Location | null) => void;
  placeholder?: string;
  required?: boolean;
}

export function AddressSearch({ value, onChange, placeholder = 'Digite um endereço...', required = false }: AddressSearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ description: string; placeId: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debounce para buscar sugestões
    const timer = setTimeout(() => {
      if (inputValue.length >= 3) {
        handleSearchSuggestions(inputValue);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    // Fechar sugestões ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSuggestions = async (query: string) => {
    try {
      const results = await searchAddressSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Erro ao buscar sugestões:', error);
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = async (suggestion: { description: string; placeId: string }) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setIsSearching(true);

    try {
      const details = await getPlaceDetails(suggestion.placeId);
      if (details) {
        const location: Location = {
          id: `address-${suggestion.placeId}`,
          name: details.formattedAddress,
          city: details.city,
          lat: details.lat,
          lng: details.lng,
        };
        setSelectedLocation(location);
        onChange(location);
      }
    } catch (error) {
      console.error('Erro ao obter detalhes:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeocodeDirect = async () => {
    if (!inputValue.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      const result = await geocodeAddress(inputValue);
      if (result) {
        const location: Location = {
          id: `address-${Date.now()}`,
          name: result.formattedAddress,
          city: result.city,
          lat: result.lat,
          lng: result.lng,
        };
        setSelectedLocation(location);
        onChange(location);
      } else {
        alert('Endereço não encontrado. Tente ser mais específico (ex: "Rua X, 123, Belo Horizonte").');
        onChange(null);
      }
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      alert('Erro ao buscar endereço. Verifique sua conexão e tente novamente.');
      onChange(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    setSelectedLocation(null);
    onChange(null);
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0 && showSuggestions) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        handleGeocodeDirect();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setSelectedLocation(null);
            onChange(null);
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          className="w-full pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C4161C] focus:border-transparent transition-all duration-300 hover:shadow-md"
        />
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Sugestões */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.placeId}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                <MapPin className="w-4 h-4 text-[#C4161C] flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1">{suggestion.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Localização selecionada */}
      {selectedLocation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 bg-green-50 border border-green-200 rounded-xl p-3"
        >
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-green-800">Endereço encontrado:</p>
              <p className="text-xs text-green-700">{selectedLocation.name}</p>
              <p className="text-xs text-green-600">{selectedLocation.city}</p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-green-400 hover:text-green-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Botão de busca manual (se não houver sugestões) */}
      {inputValue && !showSuggestions && !selectedLocation && (
        <button
          type="button"
          onClick={handleGeocodeDirect}
          disabled={isSearching}
          className="mt-2 w-full px-4 py-2 bg-[#C4161C] text-white rounded-lg text-sm font-semibold hover:bg-[#8B0F14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Buscar este endereço
            </>
          )}
        </button>
      )}
    </div>
  );
}

