import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import { CalculationResults } from '../types';
import { formatCurrency, formatPercent, formatYears } from '../utils/calculations';

interface ResultsPanelProps {
  results: CalculationResults;
}

const VERDICT_CONFIG = {
  positive: {
    bg: 'bg-green-50', border: 'border-green-300',
    text: 'text-green-800', badge: 'bg-green-500',
    label: '< 8 лет — Выгодно',
  },
  neutral: {
    bg: 'bg-yellow-50', border: 'border-yellow-300',
    text: 'text-yellow-800', badge: 'bg-yellow-500',
    label: '9–11 лет — Рыночная цена',
  },
  negative: {
    bg: 'bg-red-50', border: 'border-red-300',
    text: 'text-red-800', badge: 'bg-red-500',
    label: '12+ лет — Цена завышена',
  },
};

function getCapRateColor(r: number) {
  if (r >= 8) return 'text-green-600';
  if (r >= 5) return 'text-yellow-600';
  return 'text-red-600';
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const cfg = VERDICT_CONFIG[results.verdict];
  const { comparison } = results;

  // График: полный капитал — начинаем с года 0
  const chartData = [
    {
      year: 0,
      'Недвижимость': results.purchasePrice,
      'Вклад': results.purchasePrice,
    },
    ...results.yearlyData.map((d) => ({
      year: d.year,
      'Недвижимость': d.realEstateTotal,
      'Вклад': d.depositTotal,
    })),
  ];

  const allValues = chartData.flatMap((d) => [d['Недвижимость'], d['Вклад']]);
  const yMax = Math.max(...allValues) * 1.05;
  const yMin = results.purchasePrice * 0.9;

  // Точка пересечения линий (где RE обгоняет депозит или наоборот)
  let crossoverYear: number | null = null;
  for (let i = 1; i < results.yearlyData.length; i++) {
    const prev = results.yearlyData[i - 1];
    const curr = results.yearlyData[i];
    const prevDiff = prev.realEstateTotal - prev.depositTotal;
    const currDiff = curr.realEstateTotal - curr.depositTotal;
    if (prevDiff * currDiff < 0) {
      crossoverYear = curr.year;
      break;
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Результаты</h2>

      {/* Вердикт */}
      <div className={`${cfg.bg} border-2 ${cfg.border} rounded-xl p-4 mb-4 flex items-center gap-4`}>
        <div className={`w-11 h-11 rounded-full ${cfg.badge} flex items-center justify-center flex-shrink-0`}>
          <span className="text-white text-lg font-bold">
            {results.verdict === 'positive' ? '✓' : results.verdict === 'neutral' ? '~' : '✗'}
          </span>
        </div>
        <div>
          <div className={`text-base font-semibold ${cfg.text}`}>{results.verdictText}</div>
          <div className={`text-xs ${cfg.text} opacity-70`}>{cfg.label}</div>
        </div>
      </div>

      {/* Метрики */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="panel text-center">
          <div className={`text-xl font-mono font-bold ${
            results.verdict === 'positive' ? 'text-green-600' :
            results.verdict === 'neutral' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {results.paybackFound ? formatYears(results.paybackYears) : '30+ лет'}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">
            Окупаемость
          </div>
          <div className="text-xs text-slate-400 mt-0.5">после опех и налогов</div>
        </div>
        <div className="panel text-center">
          <div className={`text-xl font-mono font-bold ${getCapRateColor(results.capRate)}`}>
            {formatPercent(results.capRate)}
          </div>
          <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">Cap Rate</div>
          <div className="text-xs text-slate-400 mt-0.5">NOI / цена объекта</div>
        </div>
      </div>

      {/* Карточка сравнения капитала */}
      {comparison && (
        <div className={`rounded-xl border-2 p-4 mb-4 ${
          comparison.winner === 'rental' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Полный капитал через {comparison.years} лет
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div className={`rounded-lg p-3 text-center ${
              comparison.winner === 'rental' ? 'bg-blue-100' : 'bg-white'
            }`}>
              <div className="text-xs text-slate-500 mb-1">Недвижимость</div>
              <div className={`font-mono font-bold text-sm ${
                comparison.winner === 'rental' ? 'text-blue-700' : 'text-slate-600'
              }`}>
                {formatCurrency(comparison.reTotal)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">объект + аренда</div>
              {comparison.winner === 'rental' && (
                <div className="text-xs text-blue-600 font-semibold mt-1">Выгоднее</div>
              )}
            </div>
            <div className={`rounded-lg p-3 text-center ${
              comparison.winner === 'deposit' ? 'bg-orange-100' : 'bg-white'
            }`}>
              <div className="text-xs text-slate-500 mb-1">
                Вклад {formatPercent(results.depositRate, 0)}
              </div>
              <div className={`font-mono font-bold text-sm ${
                comparison.winner === 'deposit' ? 'text-orange-700' : 'text-slate-600'
              }`}>
                {formatCurrency(comparison.depositTotal)}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">тело + проценты</div>
              {comparison.winner === 'deposit' && (
                <div className="text-xs text-orange-600 font-semibold mt-1">Выгоднее</div>
              )}
            </div>
          </div>
          <div className="text-xs text-center text-slate-400">
            Разница: <span className="font-semibold text-slate-600">{formatCurrency(comparison.diff)}</span>
            {' · '}налог на аренду {results.taxRate}%
            {crossoverYear && (
              <span> · RE обгоняет вклад на году {crossoverYear}</span>
            )}
          </div>
        </div>
      )}

      {/* График: полный капитал */}
      <div className="panel">
        <h3 className="section-title mb-1">Сравнение капитала</h3>
        <p className="text-xs text-slate-400 mb-3">
          Цена объекта + чистый доход vs тело вклада + проценты
        </p>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                label={{ value: 'лет', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                domain={[yMin, yMax]}
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}М` : `${Math.round(v / 1000)}К`
                }
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelFormatter={(label) => label === 0 ? 'Старт' : `Год ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              {crossoverYear && (
                <ReferenceLine
                  x={crossoverYear}
                  stroke="#94a3b8"
                  strokeDasharray="4 2"
                  label={{ value: `год ${crossoverYear}`, position: 'top', fontSize: 10, fill: '#64748b' }}
                />
              )}
              <Line
                type="monotone"
                dataKey="Недвижимость"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Вклад"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
