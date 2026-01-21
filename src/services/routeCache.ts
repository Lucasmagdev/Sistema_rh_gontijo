/**
 * Serviço de cache para rotas calculadas
 * Reduz requisições desnecessárias à API do Google
 */

import { Route, RouteRequest } from '../types/route';

interface CachedRoute {
  routes: Route[];
  timestamp: number;
  request: RouteRequest;
}

// Cache em memória (persiste durante a sessão)
const memoryCache = new Map<string, CachedRoute>();

// Tolerância para considerar coordenadas "iguais" (em graus)
const COORDINATE_TOLERANCE = 0.001; // ~111 metros
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutos

/**
 * Gera uma chave de cache baseada na origem e destino
 */
function generateCacheKey(request: RouteRequest): string {
  // Arredondar coordenadas para tolerância (evita cache duplicado para locais muito próximos)
  const roundCoord = (coord: number) => Math.round(coord / COORDINATE_TOLERANCE) * COORDINATE_TOLERANCE;
  
  return `${roundCoord(request.origin.lat)},${roundCoord(request.origin.lng)}_${roundCoord(request.destination.lat)},${roundCoord(request.destination.lng)}`;
}

/**
 * Verifica se uma rota está em cache e ainda é válida
 */
export function getCachedRoute(request: RouteRequest): Route[] | null {
  const key = generateCacheKey(request);
  const cached = memoryCache.get(key);
  
  if (!cached) {
    return null;
  }
  
  // Verificar se o cache ainda é válido (não expirou)
  const now = Date.now();
  if (now - cached.timestamp > CACHE_DURATION_MS) {
    memoryCache.delete(key);
    return null;
  }
  
  console.log('✅ Rota encontrada no cache:', key);
  return cached.routes;
}

/**
 * Armazena uma rota no cache
 */
export function setCachedRoute(request: RouteRequest, routes: Route[]): void {
  const key = generateCacheKey(request);
  memoryCache.set(key, {
    routes,
    timestamp: Date.now(),
    request,
  });
  
  console.log('💾 Rota armazenada no cache:', key);
  
  // Limitar tamanho do cache (manter apenas últimas 50 rotas)
  if (memoryCache.size > 50) {
    const oldestKey = Array.from(memoryCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
    memoryCache.delete(oldestKey);
  }
}

/**
 * Limpa o cache
 */
export function clearCache(): void {
  memoryCache.clear();
  console.log('🗑️ Cache limpo');
}

/**
 * Retorna estatísticas do cache
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}

