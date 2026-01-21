/**
 * Serviço de geocodificação usando Google Geocoding API
 * Converte endereços em coordenadas (lat/lng)
 */

const GOOGLE_GEOCODING_API = 'https://maps.googleapis.com/maps/api/geocode/json';

export interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
  city: string;
  formattedAddress: string;
}

/**
 * Geocodifica um endereço (converte texto em coordenadas)
 */
export async function geocodeAddress(address: string, apiKey?: string): Promise<GeocodingResult | null> {
  if (!apiKey) {
    // Fallback: tentar usar a mesma API key do Routes
    apiKey = import.meta.env.VITE_GOOGLE_ROUTES_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  if (!apiKey) {
    console.warn('Google API Key não configurada para geocodificação');
    return null;
  }

  try {
    const response = await fetch(
      `${GOOGLE_GEOCODING_API}?address=${encodeURIComponent(address)}&key=${apiKey}&language=pt-BR&region=br`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API Error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      // Extrair cidade dos componentes
      const cityComponent = result.address_components.find((comp: any) =>
        comp.types.includes('administrative_area_level_2') || comp.types.includes('locality')
      );
      const city = cityComponent?.long_name || 'Belo Horizonte';

      return {
        address: address,
        lat: location.lat,
        lng: location.lng,
        city: city,
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}

/**
 * Busca sugestões de endereços usando Google Places Autocomplete
 * (Nota: Requer Places API habilitada)
 */
export async function searchAddressSuggestions(
  query: string,
  apiKey?: string
): Promise<Array<{ description: string; placeId: string }>> {
  if (!apiKey) {
    apiKey = import.meta.env.VITE_GOOGLE_ROUTES_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  if (!apiKey || !query || query.length < 3) {
    return [];
  }

  try {
    // Usar Places Autocomplete API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}&language=pt-BR&components=country:br`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (data.status === 'OK' && data.predictions) {
      return data.predictions.map((prediction: any) => ({
        description: prediction.description,
        placeId: prediction.place_id,
      }));
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    return [];
  }
}

/**
 * Obtém detalhes de um lugar usando Place ID
 */
export async function getPlaceDetails(placeId: string, apiKey?: string): Promise<GeocodingResult | null> {
  if (!apiKey) {
    apiKey = import.meta.env.VITE_GOOGLE_ROUTES_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  }

  if (!apiKey) {
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=pt-BR&fields=geometry,formatted_address,address_components`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      const location = result.geometry.location;

      const cityComponent = result.address_components?.find((comp: any) =>
        comp.types.includes('administrative_area_level_2') || comp.types.includes('locality')
      );
      const city = cityComponent?.long_name || 'Belo Horizonte';

      return {
        address: result.formatted_address,
        lat: location.lat,
        lng: location.lng,
        city: city,
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao obter detalhes do lugar:', error);
    return null;
  }
}

