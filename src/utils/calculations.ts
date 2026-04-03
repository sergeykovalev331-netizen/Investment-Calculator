import { InputData, YearlyData, CalculationResults, Verdict, TAX_RATES } from '../types';

const MAX_YEARS = 30;
const DEPOSIT_TAX = 0.13;

export function calculateInvestment(input: InputData): CalculationResults {
  const { purchasePrice, map1, map2, indexation, operatingExpenses, depositRate, taxRegime } = input;
  const taxRate = TAX_RATES[taxRegime];
  const opexRate = operatingExpenses / 100;
  const depositEffectiveRate = (depositRate / 100) * (1 - DEPOSIT_TAX);

  const yearlyData: YearlyData[] = [];
  let cumulativeNetIncome = 0;
  let paybackYears = MAX_YEARS;
  let paybackFound = false;

  for (let year = 1; year <= MAX_YEARS; year++) {
    // 1. МАП с индексацией
    let monthlyRent: number;
    if (year === 1) {
      monthlyRent = map1;
    } else if (year === 2) {
      monthlyRent = map2;
    } else {
      monthlyRent = map2 * Math.pow(1 + indexation / 100, year - 2);
    }

    // 2. Доходы и расходы
    const annualGross = monthlyRent * 12;
    const opexAmount = annualGross * opexRate;
    const noi = annualGross - opexAmount;          // NOI
    const netIncome = noi * (1 - taxRate / 100);   // после налога

    cumulativeNetIncome += netIncome;

    // 3. Окупаемость — когда чистый накопленный доход >= цена
    if (!paybackFound && cumulativeNetIncome >= purchasePrice) {
      const prev = cumulativeNetIncome - netIncome;
      paybackYears = year - 1 + (purchasePrice - prev) / netIncome;
      paybackFound = true;
    }

    // 4. Полный капитал: недвижимость vs вклад
    const realEstateTotal = purchasePrice + cumulativeNetIncome;
    const depositTotal = purchasePrice * Math.pow(1 + depositEffectiveRate, year);

    yearlyData.push({
      year,
      monthlyRent: Math.round(monthlyRent),
      annualGross: Math.round(annualGross),
      opexAmount: Math.round(opexAmount),
      noi: Math.round(noi),
      netIncome: Math.round(netIncome),
      cumulativeNetIncome: Math.round(cumulativeNetIncome),
      realEstateTotal: Math.round(realEstateTotal),
      depositTotal: Math.round(depositTotal),
    });

    const showUntil = Math.max(10, Math.ceil(paybackYears) + 3);
    if (paybackFound && year >= showUntil) break;
  }

  // Cap Rate — NOI первого года / цена (настоящий Cap Rate)
  const year1Gross = map2 * 12;
  const year1NOI = year1Gross * (1 - opexRate);
  const capRate = purchasePrice > 0 ? (year1NOI / purchasePrice) * 100 : 0;

  // Вердикт по ЧИСТОЙ окупаемости (после опех и налогов)
  let verdict: Verdict;
  let verdictText: string;

  if (!paybackFound) {
    verdict = 'negative';
    verdictText = 'Не окупается за 30 лет';
  } else if (paybackYears < 9) {
    verdict = 'positive';
    verdictText = 'Выгодная покупка';
  } else if (paybackYears <= 11) {
    verdict = 'neutral';
    verdictText = 'Рыночная цена';
  } else {
    verdict = 'negative';
    verdictText = 'Цена завышена';
  }

  // Сравнение на горизонте 10 лет (полный капитал)
  const compYears = Math.min(10, yearlyData.length);
  const compRow = yearlyData[compYears - 1];
  let comparison = null;
  if (compRow) {
    const reTotal = compRow.realEstateTotal;
    const depTotal = compRow.depositTotal;
    const winner = reTotal >= depTotal ? ('rental' as const) : ('deposit' as const);
    comparison = {
      years: compYears,
      reTotal,
      depositTotal: depTotal,
      winner,
      diff: Math.abs(reTotal - depTotal),
    };
  }

  return {
    paybackYears: paybackFound ? paybackYears : MAX_YEARS,
    paybackFound,
    capRate,
    verdict,
    verdictText,
    yearlyData,
    purchasePrice,
    taxRate,
    depositRate,
    comparison,
  };
}

export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + ' млн ₽';
  }
  if (Math.abs(value) >= 1_000) {
    return Math.round(value / 1_000) + ' тыс ₽';
  }
  return Math.round(value) + ' ₽';
}

export function formatPercent(value: number, decimals = 1): string {
  return value.toFixed(decimals) + '%';
}

export function formatYears(value: number): string {
  const years = Math.floor(value);
  const months = Math.round((value - years) * 12);
  if (months === 0) {
    return `${years} ${pluralize(years, 'год', 'года', 'лет')}`;
  }
  return `${years} ${pluralize(years, 'год', 'года', 'лет')} ${months} мес`;
}

function pluralize(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value));
}
