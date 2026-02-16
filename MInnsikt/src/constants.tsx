
import { DistrictData, BoligType, Standard } from './types';

export const BOLIGTYPE_FACTORS: Record<BoligType, number> = {
  [BoligType.LEILIGHET]: 1.00,
  [BoligType.REKKEHUS]: 0.92,
  [BoligType.TOMANNSBOLIG]: 0.88,
  [BoligType.ENEBOLIG]: 0.85
};

export const STANDARD_FACTORS: Record<Standard, number> = {
  [Standard.STANDARD]: 0.00,
  [Standard.OPPGRADERT]: 0.08,
  [Standard.RENOVERINGSBEHOV]: -0.10
};

export const DISTRICTS: DistrictData[] = [
  {
    id: 'vestre-aker',
    name: 'Vestre Aker',
    priceTrend: 3.2,
    avgSqmPrice: 115000,
    medianPrice: 12.5,
    daysOnMarket: 18,
    description: 'Sterkere prisvekst enn byen for øvrig. Høyt prisnivå.',
    path: ''
  },
  {
    id: 'nordre-aker',
    name: 'Nordre Aker',
    priceTrend: 2.8,
    avgSqmPrice: 104000,
    medianPrice: 9.8,
    daysOnMarket: 21,
    description: 'Stabil vekst i et populært boligområde for barnefamilier.',
    path: ''
  },
  {
    id: 'bjerke',
    name: 'Bjerke',
    priceTrend: 2.2,
    avgSqmPrice: 72000,
    medianPrice: 5.9,
    daysOnMarket: 24,
    description: 'Område i vekst med mange nye boligprosjekter.',
    path: ''
  },
  {
    id: 'grorud',
    name: 'Grorud',
    priceTrend: 1.8,
    avgSqmPrice: 65000,
    medianPrice: 4.2,
    daysOnMarket: 25,
    description: 'Bydel med god tilgang på rimeligere familieboliger.',
    path: ''
  },
  {
    id: 'stovner',
    name: 'Stovner',
    priceTrend: 1.4,
    avgSqmPrice: 62000,
    medianPrice: 3.6,
    daysOnMarket: 30,
    description: 'Oslos rimeligste bydel med mange grønne lunger.',
    path: ''
  },
  {
    id: 'ullern',
    name: 'Ullern',
    priceTrend: 3.5,
    avgSqmPrice: 108000,
    medianPrice: 11.2,
    daysOnMarket: 19,
    description: 'Attraktivt område med nærhet til både sjø og skog.',
    path: ''
  },
  {
    id: 'frogner',
    name: 'Frogner',
    priceTrend: 4.1,
    avgSqmPrice: 128000,
    medianPrice: 8.5,
    daysOnMarket: 22,
    description: 'Høyest kvadratmeterpris i Oslo. Vedvarende høy etterspørsel.',
    path: ''
  },
  {
    id: 'st-hanshaugen',
    name: 'St. Hanshaugen',
    priceTrend: 2.4,
    avgSqmPrice: 98000,
    medianPrice: 6.2,
    daysOnMarket: 17,
    description: 'Sentralt og urbant område med mange mindre leiligheter.',
    path: ''
  },
  {
    id: 'sagene',
    name: 'Sagene',
    priceTrend: 2.5,
    avgSqmPrice: 95000,
    medianPrice: 5.8,
    daysOnMarket: 18,
    description: 'Populært og sjarmerende område langs Akerselva.',
    path: ''
  },
  {
    id: 'grunerlokka',
    name: 'Grünerløkka',
    priceTrend: 2.1,
    avgSqmPrice: 92000,
    medianPrice: 5.4,
    daysOnMarket: 16,
    description: 'Høy likviditet og mange salg. Populært blant unge voksne.',
    path: ''
  },
  {
    id: 'gamle-oslo',
    name: 'Gamle Oslo',
    priceTrend: 3.8,
    avgSqmPrice: 88000,
    medianPrice: 5.8,
    daysOnMarket: 20,
    description: 'Størst utvikling i Bjørvika og Sørenga drar opp snittet.',
    path: ''
  },
  {
    id: 'alna',
    name: 'Alna',
    priceTrend: 1.5,
    avgSqmPrice: 62000,
    medianPrice: 4.5,
    daysOnMarket: 28,
    description: 'Moderat prisvekst. Godt tilbud av større familieboliger.',
    path: ''
  },
  {
    id: 'oestensjoe',
    name: 'Østensjø',
    priceTrend: 2.0,
    avgSqmPrice: 78000,
    medianPrice: 5.2,
    daysOnMarket: 22,
    description: 'Veletablert boligområde med mange rekkehus og eneboliger.',
    path: ''
  },
  {
    id: 'nordstrand',
    name: 'Nordstrand',
    priceTrend: 2.9,
    avgSqmPrice: 88000,
    medianPrice: 7.5,
    daysOnMarket: 20,
    description: 'Kjent for flott utsikt og attraktive eneboliger.',
    path: ''
  },
  {
    id: 'soendre-nordstrand',
    name: 'Søndre Nordstrand',
    priceTrend: 1.2,
    avgSqmPrice: 58000,
    medianPrice: 3.8,
    daysOnMarket: 32,
    description: 'Nyere bydel med god plass og rimelige priser.',
    path: ''
  }
];

export const CITY_AVERAGE = {
  priceTrend: 2.4,
  daysOnMarket: 19,
  medianPrice: 5.8,
  avgSqmPrice: 94500
};
