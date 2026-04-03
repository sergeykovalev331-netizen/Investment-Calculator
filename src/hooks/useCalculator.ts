import { useState, useMemo } from 'react';
import { InputData, CalculationResults, DEFAULT_INPUT, EMPTY_INPUT } from '../types';
import { calculateInvestment } from '../utils/calculations';

export function useCalculator() {
  const [inputData, setInputData] = useState<InputData>(DEFAULT_INPUT);

  const results: CalculationResults = useMemo(() => {
    return calculateInvestment(inputData);
  }, [inputData]);

  const updateInput = (newData: InputData) => {
    setInputData(newData);
  };

  const resetToDefaults = () => {
    setInputData(EMPTY_INPUT);
  };

  return {
    inputData,
    results,
    updateInput,
    resetToDefaults,
  };
}
