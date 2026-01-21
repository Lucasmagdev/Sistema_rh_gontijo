/**
 * Rate Limiter para controlar requisições à API
 * Evita muitas requisições em sequência
 */

interface RequestRecord {
  timestamp: number;
  count: number;
}

// Histórico de requisições (últimos 60 segundos)
const requestHistory: RequestRecord[] = [];
const MAX_REQUESTS_PER_MINUTE = 10; // Máximo de 10 requisições por minuto
const WINDOW_MS = 60 * 1000; // Janela de 60 segundos

/**
 * Verifica se pode fazer uma nova requisição
 */
export function canMakeRequest(): boolean {
  const now = Date.now();
  
  // Remover requisições antigas (fora da janela)
  while (requestHistory.length > 0 && now - requestHistory[0].timestamp > WINDOW_MS) {
    requestHistory.shift();
  }
  
  // Contar requisições na janela atual
  const recentRequests = requestHistory.filter(
    req => now - req.timestamp <= WINDOW_MS
  );
  
  if (recentRequests.length >= MAX_REQUESTS_PER_MINUTE) {
    console.warn(`⚠️ Rate limit atingido: ${recentRequests.length}/${MAX_REQUESTS_PER_MINUTE} requisições na última minuto`);
    return false;
  }
  
  return true;
}

/**
 * Registra uma requisição
 */
export function recordRequest(): void {
  requestHistory.push({
    timestamp: Date.now(),
    count: 1,
  });
  
  // Limpar histórico antigo periodicamente
  if (requestHistory.length > MAX_REQUESTS_PER_MINUTE * 2) {
    const now = Date.now();
    const filtered = requestHistory.filter(req => now - req.timestamp <= WINDOW_MS);
    requestHistory.length = 0;
    requestHistory.push(...filtered);
  }
}

/**
 * Retorna estatísticas do rate limiter
 */
export function getRateLimitStats(): { recent: number; max: number; canRequest: boolean } {
  const now = Date.now();
  const recent = requestHistory.filter(req => now - req.timestamp <= WINDOW_MS).length;
  
  return {
    recent,
    max: MAX_REQUESTS_PER_MINUTE,
    canRequest: canMakeRequest(),
  };
}

