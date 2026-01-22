/**
 * Serviço para buscar linhas reais de ônibus do GTFS de Belo Horizonte
 */

import { Location } from '../types/route';
import { BusLine } from '../types/route';

interface GTFSLine {
  linha: string;
  nome_linha: string;
  route_id: string;
  tipo_servico: string;
  direction_id: string;
  origem_stop_name: string;
  origem_lat: number;
  origem_lon: number;
  destino_stop_name: string;
  destino_lat: number;
  destino_lon: number;
}

interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
}

/**
 * Calcula distância entre dois pontos (Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Encontra paradas próximas a uma localização
 */
function findNearbyStops(location: Location, stops: GTFSStop[], maxDistance: number = 0.5): GTFSStop[] {
  return stops
    .map(stop => ({
      ...stop,
      distance: calculateDistance(location.lat, location.lng, stop.stop_lat, stop.stop_lon),
    }))
    .filter(stop => stop.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5); // Top 5 mais próximas
}

/**
 * Busca linhas que conectam origem e destino
 */
function findConnectingLines(
  originStops: GTFSStop[],
  destinationStops: GTFSStop[],
  lines: GTFSLine[]
): Array<{ line: GTFSLine; originStop: GTFSStop; destinationStop: GTFSStop; distance: number }> {
  const connectingLines: Array<{ line: GTFSLine; originStop: GTFSStop; destinationStop: GTFSStop; distance: number }> = [];

  // Buscar linhas que passam perto da origem OU destino
  // E que vão na direção correta (origem -> destino)
  for (const line of lines) {
    // Verificar se a linha passa perto da origem
    let bestOriginStop: GTFSStop | null = null;
    let bestOriginDistance = Infinity;
    
    for (const originStop of originStops) {
      const originDistance = calculateDistance(
        originStop.stop_lat,
        originStop.stop_lon,
        line.origem_lat,
        line.origem_lon
      );
      if (originDistance < bestOriginDistance && originDistance < 2.0) { // Aumentar raio para 2km
        bestOriginDistance = originDistance;
        bestOriginStop = originStop;
      }
    }

    // Verificar se a linha passa perto do destino
    let bestDestStop: GTFSStop | null = null;
    let bestDestDistance = Infinity;
    
    for (const destinationStop of destinationStops) {
      const destDistance = calculateDistance(
        destinationStop.stop_lat,
        destinationStop.stop_lon,
        line.destino_lat,
        line.destino_lon
      );
      if (destDistance < bestDestDistance && destDistance < 2.0) { // Aumentar raio para 2km
        bestDestDistance = destDistance;
        bestDestStop = destinationStop;
      }
    }

    // Se encontrou paradas próximas, adicionar a linha
    if (bestOriginStop && bestDestStop) {
      const totalDistance = bestOriginDistance + bestDestDistance;
      connectingLines.push({
        line,
        originStop: bestOriginStop,
        destinationStop: bestDestStop,
        distance: totalDistance,
      });
    }
  }

  // Ordenar por distância e remover duplicatas
  return connectingLines
    .sort((a, b) => a.distance - b.distance)
    .filter((item, index, self) =>
      index === self.findIndex((t) => t.line.route_id === item.line.route_id)
    )
    .slice(0, 10); // Top 10 linhas
}

/**
 * Carrega dados do GTFS (linhas e paradas)
 */
let cachedLines: GTFSLine[] | null = null;
let cachedStops: GTFSStop[] | null = null;

async function loadGTFSData(): Promise<{ lines: GTFSLine[]; stops: GTFSStop[] }> {
  if (cachedLines && cachedStops) {
    return { lines: cachedLines, stops: cachedStops };
  }

  try {
    // Carregar linhas com origem e destino (tem coordenadas)
    // Tentar múltiplos caminhos
    let linesResponse = await fetch('/linhas_origem_destino.csv');
    if (!linesResponse.ok) {
      linesResponse = await fetch('./linhas_origem_destino.csv');
    }
    if (!linesResponse.ok) {
      linesResponse = await fetch('/GTFS/GTFSBHTRANS/linhas_origem_destino.csv');
    }
    if (!linesResponse.ok) {
      throw new Error('Erro ao carregar linhas do GTFS');
    }
    
    const csvText = await linesResponse.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Função para parsear CSV corretamente (lidando com vírgulas dentro de aspas)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    cachedLines = lines.slice(1).map(line => {
      const values = parseCSVLine(line);
      const getValue = (header: string) => {
        const idx = headers.indexOf(header);
        return idx >= 0 ? (values[idx]?.replace(/^"|"$/g, '').trim() || '') : '';
      };
      
      return {
        linha: getValue('linha'),
        nome_linha: getValue('nome_linha'),
        route_id: getValue('route_id'),
        tipo_servico: getValue('tipo_servico') || 'estruturais',
        direction_id: getValue('direction_id') || '0',
        origem_stop_name: getValue('origem_stop_name'),
        origem_lat: parseFloat(getValue('origem_lat')) || 0,
        origem_lon: parseFloat(getValue('origem_lon')) || 0,
        destino_stop_name: getValue('destino_stop_name'),
        destino_lat: parseFloat(getValue('destino_lat')) || 0,
        destino_lon: parseFloat(getValue('destino_lon')) || 0,
      };
    }).filter(line => line.linha && line.origem_lat !== 0 && line.origem_lon !== 0);

    // Extrair paradas únicas das linhas
    const stopMap = new Map<string, GTFSStop>();
    for (const line of cachedLines) {
      if (line.origem_lat && line.origem_lon && line.origem_stop_name) {
        stopMap.set(line.origem_stop_name, {
          stop_id: `stop-${line.origem_stop_name}`,
          stop_name: line.origem_stop_name,
          stop_lat: line.origem_lat,
          stop_lon: line.origem_lon,
        });
      }
      if (line.destino_lat && line.destino_lon && line.destino_stop_name) {
        stopMap.set(line.destino_stop_name, {
          stop_id: `stop-${line.destino_stop_name}`,
          stop_name: line.destino_stop_name,
          stop_lat: line.destino_lat,
          stop_lon: line.destino_lon,
        });
      }
    }
    cachedStops = Array.from(stopMap.values());

    return { lines: cachedLines, stops: cachedStops };
  } catch (error) {
    console.error('Erro ao carregar dados do GTFS:', error);
    return { lines: [], stops: [] };
  }
}

/**
 * Busca linhas reais de ônibus que conectam origem e destino
 */
export async function findBusLines(
  origin: Location,
  destination: Location
): Promise<Array<{ busLine: BusLine; from: string; to: string; distance: number }>> {
  const { lines, stops } = await loadGTFSData();

  if (lines.length === 0 || stops.length === 0) {
    console.warn('Dados do GTFS não disponíveis');
    return [];
  }

  // Encontrar paradas próximas (aumentar raio para 2km)
  const originStops = findNearbyStops(origin, stops, 2.0);
  const destinationStops = findNearbyStops(destination, stops, 2.0);

  console.log('GTFS Debug:', {
    totalLines: lines.length,
    totalStops: stops.length,
    originStops: originStops.length,
    destinationStops: destinationStops.length,
    origin: { lat: origin.lat, lng: origin.lng, name: origin.name },
    destination: { lat: destination.lat, lng: destination.lng, name: destination.name },
  });

  if (originStops.length === 0 || destinationStops.length === 0) {
    console.warn('Nenhuma parada encontrada próxima à origem ou destino', {
      originStops: originStops.length,
      destinationStops: destinationStops.length,
    });
    // Mesmo sem paradas próximas, vamos tentar buscar linhas genéricas
    // que possam ser úteis
    return lines.slice(0, 3).map(line => ({
      busLine: {
        number: line.linha,
        name: line.nome_linha,
        type: line.tipo_servico.includes('metro') ? 'metropolitano' : 'urbano',
      },
      from: line.origem_stop_name,
      to: line.destino_stop_name,
      distance: calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng),
    }));
  }

  // Buscar linhas que conectam
  const connectingLines = findConnectingLines(originStops, destinationStops, lines);

  console.log('GTFS Debug - Linhas encontradas:', connectingLines.length);

  if (connectingLines.length === 0) {
    // Se não encontrou linhas específicas, retornar linhas genéricas do GTFS
    // (sempre retornar linhas reais, nunca mock)
    console.log('Nenhuma linha específica encontrada, usando linhas genéricas do GTFS');
    
    // Buscar linhas que passam perto da origem ou destino
    const nearbyLines = lines
      .map(line => {
        const originDist = calculateDistance(origin.lat, origin.lng, line.origem_lat, line.origem_lon);
        const destDist = calculateDistance(destination.lat, destination.lng, line.destino_lat, line.destino_lon);
        return {
          line,
          minDistance: Math.min(originDist, destDist),
        };
      })
      .filter(item => item.minDistance < 10) // Dentro de 10km
      .sort((a, b) => a.minDistance - b.minDistance)
      .slice(0, 5)
      .map(item => ({
        busLine: {
          number: item.line.linha,
          name: item.line.nome_linha,
          type: item.line.tipo_servico.includes('metro') ? 'metropolitano' : 'urbano',
        },
        from: item.line.origem_stop_name,
        to: item.line.destino_stop_name,
        distance: item.minDistance,
      }));

    // Se ainda não encontrou, retornar linhas aleatórias do GTFS
    if (nearbyLines.length === 0 && lines.length > 0) {
      return lines.slice(0, 3).map(line => ({
        busLine: {
          number: line.linha,
          name: line.nome_linha,
          type: line.tipo_servico.includes('metro') ? 'metropolitano' : 'urbano',
        },
        from: line.origem_stop_name,
        to: line.destino_stop_name,
        distance: calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng),
      }));
    }

    return nearbyLines;
  }

  // Converter para formato BusLine
  return connectingLines.map(({ line, originStop, destinationStop }) => ({
    busLine: {
      number: line.linha,
      name: line.nome_linha,
      type: line.tipo_servico.includes('metro') ? 'metropolitano' : 'urbano',
    },
    from: originStop.stop_name,
    to: destinationStop.stop_name,
    distance: calculateDistance(originStop.stop_lat, originStop.stop_lon, destinationStop.stop_lat, destinationStop.stop_lon),
  }));
}

/**
 * Busca linhas que passam por uma parada específica
 */
export async function findLinesByStop(stopName: string): Promise<BusLine[]> {
  const { lines } = await loadGTFSData();

  return lines
    .filter(line =>
      line.origem_stop_name.toLowerCase().includes(stopName.toLowerCase()) ||
      line.destino_stop_name.toLowerCase().includes(stopName.toLowerCase())
    )
    .map(line => ({
      number: line.linha,
      name: line.nome_linha,
      type: line.tipo_servico.includes('metro') ? 'metropolitano' : 'urbano',
    }));
}
