/**
 * Serviço para cálculo de tarifas de transporte público em Belo Horizonte
 * Baseado na matriz de integração oficial do BHTrans
 */

import faresData from '../../data/fares.json';

export type ServiceType = 
  | 'troncais_move'
  | 'troncais_convencionais'
  | 'estruturais'
  | 'alimentadoras'
  | 'circular'
  | 'vilas_favelas'
  | 'metro';

export type IntegrationLocation = 'at_station' | 'outside_station';

export interface FareCalculationResult {
  totalFare: number;
  firstBoardingFare: number;
  integrationFares: number[];
  breakdown: {
    service: ServiceType;
    fare: number;
    location?: IntegrationLocation;
  }[];
}

/**
 * Obtém a tarifa unitária de um serviço
 */
export function getUnitaryFare(serviceType: ServiceType): number {
  const service = faresData.services[serviceType];
  if (!service) {
    throw new Error(`Tipo de serviço desconhecido: ${serviceType}`);
  }
  return service.unitary_fare;
}

/**
 * Obtém a tarifa de integração entre dois serviços
 */
export function getIntegrationFare(
  firstService: ServiceType,
  secondService: ServiceType,
  location: IntegrationLocation = 'outside_station'
): number {
  const matrix = faresData.integration_matrix['1st_boarding'];
  const firstServiceMatrix = matrix[firstService];
  
  if (!firstServiceMatrix) {
    throw new Error(`Serviço inicial não encontrado na matriz: ${firstService}`);
  }

  const secondBoarding = firstServiceMatrix['2nd_boarding'];
  
  // Construir a chave do segundo serviço
  let secondServiceKey: string;
  
  if (secondService === 'troncais_convencionais' || 
      secondService === 'estruturais' || 
      secondService === 'alimentadoras') {
    secondServiceKey = `${secondService}_${location === 'at_station' ? 'na_estacao' : 'fora_estacao'}`;
  } else {
    secondServiceKey = secondService;
  }
  
  const fare = secondBoarding[secondServiceKey as keyof typeof secondBoarding];
  
  if (fare === undefined) {
    // Fallback: usar tarifa unitária do segundo serviço
    console.warn(`Tarifa de integração não encontrada para ${firstService} -> ${secondService}, usando tarifa unitária`);
    return getUnitaryFare(secondService);
  }
  
  return fare as number;
}

/**
 * Calcula a tarifa total de uma viagem com múltiplas integrações
 */
export function calculateFare(
  services: ServiceType[],
  integrationLocations: IntegrationLocation[] = []
): FareCalculationResult {
  if (services.length === 0) {
    throw new Error('É necessário pelo menos um serviço');
  }

  if (services.length === 1) {
    // Viagem sem integração
    const fare = getUnitaryFare(services[0]);
    return {
      totalFare: fare,
      firstBoardingFare: fare,
      integrationFares: [],
      breakdown: [
        {
          service: services[0],
          fare: fare,
        },
      ],
    };
  }

  // Primeiro embarque
  const firstBoardingFare = getUnitaryFare(services[0]);
  const integrationFares: number[] = [];
  const breakdown: FareCalculationResult['breakdown'] = [
    {
      service: services[0],
      fare: firstBoardingFare,
    },
  ];

  // Calcular integrações
  for (let i = 1; i < services.length; i++) {
    const location = integrationLocations[i - 1] || 'outside_station';
    const integrationFare = getIntegrationFare(services[i - 1], services[i], location);
    
    integrationFares.push(integrationFare);
    breakdown.push({
      service: services[i],
      fare: integrationFare,
      location,
    });
  }

  const totalFare = firstBoardingFare + integrationFares.reduce((sum, fare) => sum + fare, 0);

  return {
    totalFare,
    firstBoardingFare,
    integrationFares,
    breakdown,
  };
}

/**
 * Formata o valor da tarifa para exibição
 */
export function formatFare(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Obtém o nome amigável de um tipo de serviço
 */
export function getServiceName(serviceType: ServiceType): string {
  return faresData.services[serviceType]?.name || serviceType;
}

/**
 * Obtém a descrição de um tipo de serviço
 */
export function getServiceDescription(serviceType: ServiceType): string {
  return faresData.services[serviceType]?.description || '';
}

