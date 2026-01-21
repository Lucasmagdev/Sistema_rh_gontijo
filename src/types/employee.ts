export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat?: number;
  lng?: number;
  isMain: boolean;
}

export interface BusCard {
  id: string;
  cardNumber: string;
  cardType?: string; // Ex: "Bilhete Único", "Vale Transporte", etc.
  isActive: boolean;
}

export interface AssignedRoute {
  id: string;
  route: import('./route').Route; // Rota completa calculada
  origin: import('./route').Location; // Origem da rota
  destination: import('./route').Location; // Destino da rota
  assignedAt: string; // Data/hora de atribuição
  isActive: boolean; // Se a rota está ativa
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  position: string;
  department?: string;
  addresses: Address[];
  busCards: BusCard[]; // Até 2 cartões de ônibus
  routeToWork?: AssignedRoute; // Rota de ida (casa -> trabalho)
  routeFromWork?: AssignedRoute; // Rota de volta (trabalho -> casa)
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  document: string;
  position: string;
  department?: string;
  addresses: (Omit<Address, 'id'> & { id?: string })[];
  busCards: (Omit<BusCard, 'id'> & { id?: string })[]; // Até 2 cartões
}

