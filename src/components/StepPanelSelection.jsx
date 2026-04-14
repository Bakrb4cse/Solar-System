import React from 'react';
import { CheckCircle2, Layout, SolarPanel, ArrowRight } from 'lucide-react';
import { solarData } from '../constants/data';
import Button from './ui/Button';
import styles from './step.module.css';

const StepPanelSelection = ({ selectedPanel, setSelectedPanel, onBack, onCalculate, customerName }) => {
  return (
    <div className={styles.stepCard}>
      <h3 className={styles.title}>
        <Layout size={20} className={styles.titleIcon} /> اختر قدرة اللوح المفضل
      </h3>

      <div className={styles.panelGrid}>
        {solarData.solarPanels.map((panel) => (
          <button
            key={panel.id}
            // تخزين الكائن كاملاً (القدرة + الماركة)
            onClick={() => setSelectedPanel({ capacity: panel.capacity, brand: panel.brand })}
            className={`${styles.panelCard} ${
              // المقارنة تتم باستخدام الخاصية capacity من الكائن
              selectedPanel?.capacity === panel.capacity ? styles.panelCardActive : ''
            } flex flex-col items-center justify-center relative`}
          >
            {selectedPanel?.capacity === panel.capacity && (
              <div className={styles.checkBadge}>
                <CheckCircle2 size={16} />
              </div>
            )}

            <div className="flex items-center gap-1.5 mb-2">
              <SolarPanel 
                size={20} 
                className={`shrink-0 ${selectedPanel?.capacity === panel.capacity ? 'text-amber-500' : 'text-slate-400'}`} 
              />
              <span className="text-[12px] font-bold uppercase tracking-wider opacity-60">
                {panel.brand}
              </span>
            </div>
            
            <span className={styles.panelValue}>
              {panel.capacity.replace('W', '')}
            </span>

            <span className={styles.panelUnit}>WATT</span>
          </button>
        ))}
      </div>

      <div className="bg-emerald-50 p-4 rounded-2xl mb-6 border border-emerald-100">
        <p className="text-[11px] text-emerald-800 leading-relaxed text-center font-medium">
          عزيزي <span className="font-black underline">{customerName || 'العميل'}</span>، 
          سيتم حساب عدد الألواح بناءً على لوح <span className="font-black">{selectedPanel?.brand}</span> بقدرة <span className="font-black">{selectedPanel?.capacity}</span> لضمان كفاءة المنظومة.
        </p>
      </div>

      <div className={styles.footer}>
        <Button onClick={onBack} icon={ArrowRight} variant="secondary">
          السابق
        </Button>
        <Button onClick={onCalculate} variant="amber">
          إظهار النتائج النهائية
        </Button>
      </div>
    </div>
  );
};

export default StepPanelSelection;
