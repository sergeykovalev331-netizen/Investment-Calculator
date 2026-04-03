import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CalculationResults } from '../types';
import { formatCurrency, formatNumber } from '../utils/calculations';

interface DetailsPanelProps {
  results: CalculationResults;
}

export function DetailsPanel({ results }: DetailsPanelProps) {
  const chartData = results.yearlyData.map((d) => ({
    year: d.year,
    map: d.monthlyRent,
  }));

  const paybackYear = results.paybackFound ? Math.ceil(results.paybackYears) : null;

  return (
    <div className="h-full overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Рост аренды</h2>

      {/* График Б: МАП по годам */}
      <div className="panel mb-4">
        <h3 className="section-title mb-1">МАП по годам</h3>
        <p className="text-xs text-slate-400 mb-4">Месячный арендный поток с учётом индексации</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                label={{ value: 'год', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: '#94a3b8' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}М` : `${Math.round(v / 1000)}К`
                }
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'МАП (мес)']}
                labelFormatter={(label) => `Год ${label}`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="map" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell
                    key={entry.year}
                    fill={paybackYear && entry.year >= paybackYear ? '#22c55e' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {paybackYear && (
          <p className="text-xs text-slate-400 mt-2">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-green-500 mr-1.5" />
            Зелёные столбцы — годы после окупаемости
          </p>
        )}
      </div>

      {/* Таблица: полная раскладка по годам */}
      <div className="panel">
        <h3 className="section-title mb-3">Денежный поток по годам</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 text-left font-medium text-slate-500">Год</th>
                <th className="py-2 text-right font-medium text-slate-500">МАП</th>
                <th className="py-2 text-right font-medium text-slate-500">NOI</th>
                <th className="py-2 text-right font-medium text-slate-500">Чистый</th>
                <th className="py-2 text-right font-medium text-slate-500">Накоплено</th>
              </tr>
            </thead>
            <tbody>
              {results.yearlyData.map((row) => {
                const isPast = results.paybackFound && row.year > results.paybackYears;
                const isPayback = results.paybackFound && row.year === Math.ceil(results.paybackYears);
                return (
                  <tr
                    key={row.year}
                    className={`border-b border-slate-50 transition-colors ${
                      isPayback ? 'bg-green-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className={`py-1.5 font-medium ${isPast ? 'text-green-600' : 'text-slate-700'}`}>
                      {row.year}{isPayback && <span className="ml-1 text-green-600">★</span>}
                    </td>
                    <td className="py-1.5 text-right font-mono text-slate-500">
                      {formatNumber(row.monthlyRent)}
                    </td>
                    <td className="py-1.5 text-right font-mono text-slate-600">
                      {formatNumber(row.noi)}
                    </td>
                    <td className="py-1.5 text-right font-mono text-slate-600">
                      {formatNumber(row.netIncome)}
                    </td>
                    <td className={`py-1.5 text-right font-mono font-medium ${
                      row.cumulativeNetIncome >= results.purchasePrice
                        ? 'text-green-600' : 'text-slate-700'
                    }`}>
                      {formatNumber(row.cumulativeNetIncome)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex gap-4 text-xs text-slate-400">
          <span>★ год окупаемости</span>
          <span>NOI = доход − опех</span>
          <span>Чистый = NOI − налог</span>
        </div>
      </div>
    </div>
  );
}
