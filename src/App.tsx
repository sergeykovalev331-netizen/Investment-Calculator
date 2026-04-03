import { InputPanel, ResultsPanel, DetailsPanel } from './components';
import { useCalculator } from './hooks/useCalculator';

function App() {
  const { inputData, results, updateInput, resetToDefaults } = useCalculator();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">
              Инвестиционный калькулятор
            </h1>
            <p className="text-sm text-slate-500">Коммерческая недвижимость · Москва</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Сбросить
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Левая колонка: Ввод */}
          <div className="col-span-12 lg:col-span-3">
            <InputPanel data={inputData} onChange={updateInput} />
          </div>

          {/* Центр: Результаты + график окупаемости */}
          <div className="col-span-12 lg:col-span-5">
            <ResultsPanel results={results} />
          </div>

          {/* Правая колонка: Рост МАП + таблица */}
          <div className="col-span-12 lg:col-span-4">
            <DetailsPanel results={results} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 py-2">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between text-xs text-slate-400">
          <span>Расчёты носят информационный характер</span>
          <span>v2.0</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
