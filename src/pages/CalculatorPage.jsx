import React, { useState } from 'react';
import SolarForm from '../components/SolarForm';
import SolarCalculator from '../components/SolarCalculator';

const CalculatorPage = () => {
  const [results, setResults] = useState(null);

  const handleCalculation = (data) => {
    setResults(data);
    // يمكنك إضافة سكرول تلقائي للنتائج هنا في الجوال
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* الجانب الأيمن: المدخلات (تأخذ 7 أعمدة) */}
        <div className="lg:col-span-7">
          <SolarForm onCalculate={handleCalculation} />
        </div>

        {/* الجانب الأيسر: عرض النتائج (تأخذ 5 أعمدة) */}
        <div className="lg:col-span-5 lg:sticky lg:top-8">
          <SolarCalculator results={results} />
        </div>

      </div>
    </main>
  );
};

export default CalculatorPage;
