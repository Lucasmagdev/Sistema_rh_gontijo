/**
 * Exemplos de uso do fareCalculator
 */

import { 
  calculateFare, 
  formatFare, 
  getServiceName,
  type ServiceType,
  type IntegrationLocation 
} from './fareCalculator';

// Exemplo 1: Viagem simples sem integração
console.log('=== Exemplo 1: Viagem simples ===');
const viagemSimples = calculateFare(['troncais_convencionais']);
console.log(`Tarifa: ${formatFare(viagemSimples.totalFare)}`);
console.log(`Serviço: ${getServiceName('troncais_convencionais')}`);

// Exemplo 2: Viagem com integração (Troncal -> Alimentadora)
console.log('\n=== Exemplo 2: Integração Troncal -> Alimentadora ===');
const viagemIntegracao = calculateFare(
  ['troncais_convencionais', 'alimentadoras'],
  ['at_station'] // Integração na estação (gratuita)
);
console.log(`Tarifa total: ${formatFare(viagemIntegracao.totalFare)}`);
console.log('Detalhamento:');
viagemIntegracao.breakdown.forEach((item, index) => {
  console.log(`  ${index === 0 ? '1º Embarque' : `${index + 1}º Embarque`}: ${getServiceName(item.service)} - ${formatFare(item.fare)}`);
});

// Exemplo 3: Viagem com múltiplas integrações
console.log('\n=== Exemplo 3: Múltiplas integrações ===');
const viagemMultipla = calculateFare(
  ['alimentadoras', 'troncais_convencionais', 'estruturais'],
  ['outside_station', 'at_station']
);
console.log(`Tarifa total: ${formatFare(viagemMultipla.totalFare)}`);
console.log('Detalhamento:');
viagemMultipla.breakdown.forEach((item, index) => {
  const location = item.location 
    ? ` (${item.location === 'at_station' ? 'Na Estação' : 'Fora da Estação'})`
    : '';
  console.log(`  ${index === 0 ? '1º Embarque' : `${index + 1}º Embarque`}: ${getServiceName(item.service)}${location} - ${formatFare(item.fare)}`);
});

// Exemplo 4: Viagem com Metrô
console.log('\n=== Exemplo 4: Integração com Metrô ===');
const viagemMetro = calculateFare(
  ['troncais_move', 'metro'],
  ['at_station']
);
console.log(`Tarifa total: ${formatFare(viagemMetro.totalFare)}`);
console.log('Detalhamento:');
viagemMetro.breakdown.forEach((item, index) => {
  console.log(`  ${index === 0 ? '1º Embarque' : `${index + 1}º Embarque`}: ${getServiceName(item.service)} - ${formatFare(item.fare)}`);
});

// Exemplo 5: Viagem gratuita (Vilas e Favelas)
console.log('\n=== Exemplo 5: Linha gratuita ===');
const viagemGratuita = calculateFare(['vilas_favelas']);
console.log(`Tarifa: ${formatFare(viagemGratuita.totalFare)}`);
console.log(`Serviço: ${getServiceName('vilas_favelas')}`);

