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

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  position: string;
  department?: string;
  addresses: Address[];
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
}

