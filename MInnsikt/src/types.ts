
export enum BoligType {
  LEILIGHET = 'Leilighet',
  REKKEHUS = 'Rekkehus',
  TOMANNSBOLIG = 'Tomannsbolig',
  ENEBOLIG = 'Enebolig'
}

export enum Standard {
  RENOVERINGSBEHOV = 'Renoveringsbehov',
  STANDARD = 'Standard',
  OPPGRADERT = 'Oppgradert'
}

export interface DistrictData {
  id: string;
  name: string;
  priceTrend: number; // Percentage
  avgSqmPrice: number;
  medianPrice: number; // In millions
  daysOnMarket: number;
  description: string;
  path: string; // SVG path data
}

export interface CalculatorState {
  districtId: string;
  type: BoligType;
  area: number;
  standard: Standard;
}
