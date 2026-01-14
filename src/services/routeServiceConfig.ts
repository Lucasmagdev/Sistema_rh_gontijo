/**
 * Configuração do serviço de rotas
 * 
 * Para usar a API do Google Routes, altere USE_MOCK para false
 * e configure sua API_KEY no arquivo .env
 */
export const ROUTE_SERVICE_CONFIG = {
  USE_MOCK: true, // Altere para false quando quiser usar a API do Google
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_ROUTES_API_KEY || '',
  GOOGLE_API_ENDPOINT: 'https://routes.googleapis.com/directions/v2:computeRoutes',
};

