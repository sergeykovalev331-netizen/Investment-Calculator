export type TaxRegime = 'smz6' | 'ip7' | 'ndfl13' | 'ndfl15';

export const TAX_RATES: Record<TaxRegime, number> = {
  smz6: 6,
  ip7: 7,
  ndfl13: 13,
  ndfl15: 15,
};

export const TAX_LABELS: Record<TaxRegime, string> = {
  smz6: 'СМЗ 6%',
  ip7: 'ИП 7%',
  ndfl13: '13%',
  ndfl15: '15%',
};

export interface InputData {
  purchasePrice: number;
  map1: number;
  map2: number;
  indexation: number;
  operatingExpenses: number; // % от годового дохода (налог, коммуналка, резерв)
  depositRate: number;
  taxRegime: TaxRegime;
}

export interface YearlyData {
  year: number;
  monthlyRent: number;
  annualGross: number;          // Валовый доход (МАП × 12)
  opexAmount: number;           // Операционные расходы
  noi: number;                  // NOI = annualGross − opex
  netIncome: number;            // NOI после налога
  cumulativeNetIncome: number;  // Накопленный чистый доход
  realEstateTotal: number;      // Цена + накопленный чистый доход (весь капитал)
  depositTotal: number;         // Тело вклада + % после налога
}

export interface CalculationResults {
  paybackYears: number;
  paybackFound: boolean;
  capRate: number;             // NOI-based (после опех)
  verdict: 'positive' | 'neutral' | 'negative';
  verdictText: string;
  yearlyData: YearlyData[];
  purchasePrice: number;
  taxRate: number;
  depositRate: number;
  comparison: {
    years: number;
    reTotal: number;           // Весь капитал недвижимости
    depositTotal: number;      // Весь капитал вклада
    winner: 'rental' | 'deposit';
    diff: number;
  } | null;
}

export type Verdict = 'positive' | 'neutral' | 'negative';

export const DEFAULT_INPUT: InputData = {
  purchasePrice: 30000000,
  map1: 250000,
  map2: 270000,
  indexation: 5,
  operatingExpenses: 10,
  depositRate: 20,
  taxRegime: 'ndfl13',
};

export const EMPTY_INPUT: InputData = {
  purchasePrice: 0,
  map1: 0,
  map2: 0,
  indexation: 0,
  operatingExpenses: 0,
  depositRate: 0,
  taxRegime: 'ndfl13',
};
