import { useState } from 'react';
import { InputData, TaxRegime, TAX_LABELS } from '../types';

interface InputPanelProps {
  data: InputData;
  onChange: (data: InputData) => void;
}

function formatWithSpaces(value: number): string {
  if (value === 0) return '';
  return value.toLocaleString('ru-RU').replace(/,/g, ' ');
}

function parseFormatted(value: string): number {
  return parseFloat(value.replace(/\s/g, '').replace(',', '.')) || 0;
}

interface FieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit: string;
  placeholder: string;
  hint?: string;
  isLarge?: boolean;
  decimals?: number;
}

function Field({ label, value, onChange, unit, placeholder, hint, isLarge = false, decimals = 0 }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const [display, setDisplay] = useState(() => isLarge ? formatWithSpaces(value) : value.toString());

  const currentDisplay = focused
    ? display
    : isLarge
      ? formatWithSpaces(value)
      : (decimals > 0 ? value.toFixed(decimals) : value.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (isLarge) {
      const cleaned = raw.replace(/[^\d\s]/g, '');
      setDisplay(cleaned);
      onChange(parseFormatted(cleaned));
    } else {
      setDisplay(raw);
      onChange(parseFloat(raw) || 0);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-xs text-slate-400 font-medium">{unit}</span>
      </div>
      {hint && <p className="text-xs text-slate-400 mb-1.5">{hint}</p>}
      <input
        type="text"
        inputMode={isLarge ? 'numeric' : 'decimal'}
        className="input-field"
        value={currentDisplay}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={() => {
          setFocused(true);
          if (isLarge) setDisplay(value === 0 ? '' : value.toString());
        }}
        onBlur={() => {
          setFocused(false);
          if (isLarge) setDisplay(formatWithSpaces(value));
        }}
      />
    </div>
  );
}

const TAX_OPTIONS: TaxRegime[] = ['smz6', 'ip7', 'ndfl13', 'ndfl15'];

interface TaxToggleProps {
  value: TaxRegime;
  onChange: (v: TaxRegime) => void;
}

function TaxToggle({ value, onChange }: TaxToggleProps) {
  return (
    <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1">
      {TAX_OPTIONS.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`py-1.5 text-xs font-medium rounded-md transition-all ${
            value === opt
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {TAX_LABELS[opt]}
        </button>
      ))}
    </div>
  );
}

export function InputPanel({ data, onChange }: InputPanelProps) {
  const set = <K extends keyof InputData>(key: K, value: InputData[K]) =>
    onChange({ ...data, [key]: value });

  return (
    <div className="h-full overflow-y-auto pr-1">
      <h2 className="text-lg font-semibold text-slate-800 mb-5">Параметры объекта</h2>

      <div className="panel mb-4">
        <h3 className="section-title">Покупка</h3>
        <Field
          label="Цена объекта"
          value={data.purchasePrice}
          onChange={(v) => set('purchasePrice', v)}
          unit="₽"
          placeholder="30 000 000"
          isLarge
        />
      </div>

      <div className="panel mb-4">
        <h3 className="section-title">Арендный поток (МАП)</h3>
        <Field
          label="МАП 1-й год"
          value={data.map1}
          onChange={(v) => set('map1', v)}
          unit="₽ / мес"
          placeholder="250 000"
          hint="Месячный арендный поток в первый год"
          isLarge
        />
        <Field
          label="МАП 2-й год"
          value={data.map2}
          onChange={(v) => set('map2', v)}
          unit="₽ / мес"
          placeholder="270 000"
          hint="Месячный арендный поток во второй год"
          isLarge
        />
      </div>

      <div className="panel mb-4">
        <h3 className="section-title">Индексация</h3>
        <Field
          label="Рост аренды"
          value={data.indexation}
          onChange={(v) => set('indexation', v)}
          unit="% в год"
          placeholder="5"
          hint="Ежегодный рост ставки начиная с 3-го года"
          decimals={1}
        />
      </div>

      <div className="panel mb-4">
        <h3 className="section-title">Расходы</h3>
        <Field
          label="Операционные расходы"
          value={data.operatingExpenses}
          onChange={(v) => set('operatingExpenses', v)}
          unit="% от дохода"
          placeholder="10"
          hint="Налог на имущество, коммуналка, резерв на ремонт"
          decimals={1}
        />
      </div>

      <div className="panel">
        <h3 className="section-title">Сравнение с вкладом</h3>
        <Field
          label="Ставка вклада"
          value={data.depositRate}
          onChange={(v) => set('depositRate', v)}
          unit="% в год"
          placeholder="20"
          decimals={1}
        />
        <div className="mb-1">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Налоговый режим</label>
            <span className="text-xs text-slate-400">на доход от аренды</span>
          </div>
          <TaxToggle
            value={data.taxRegime}
            onChange={(v) => set('taxRegime', v)}
          />
        </div>
      </div>
    </div>
  );
}
