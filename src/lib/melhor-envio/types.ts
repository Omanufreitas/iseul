export type MelhorEnvioAddress = {
  name: string;
  phone: string;
  email: string;
  document: string;
  company_document?: string;
  state_register?: string;
  address: string;
  complement: string;
  number: string;
  district: string;
  city: string;
  state_abbr: string;
  postal_code: string;
  country_id: string;
};

export type MelhorEnvioCartPayload = {
  service: number;
  /** Obrigatório para transportadoras como Total Express. */
  agency?: number;
  from: MelhorEnvioAddress;
  to: MelhorEnvioAddress;
  products: Array<{
    name: string;
    quantity: number;
    unitary_value: number;
  }>;
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  options: {
    insurance_value: number;
    receipt: boolean;
    own_hand: boolean;
    reverse: boolean;
    non_commercial: boolean;
    agency_id?: number;
    invoice?: { key: string };
  };
};

export type MelhorEnvioCartResponse = {
  id: string;
};

export type MelhorEnvioCheckoutResponse = {
  purchase: {
    orders: Array<{ id: string; tracking?: string | null; status?: string }>;
  };
};

export type MelhorEnvioOrderDetails = {
  id: string;
  tracking?: string | null;
  status?: string;
  protocol?: string | null;
};

export type ShipperSettings = {
  name: string;
  document: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  stateRegister?: string;
};
