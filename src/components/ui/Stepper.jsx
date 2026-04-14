import React from 'react';
import { Minus, Plus } from 'lucide-react';
import styles from './ui.module.css';

const Stepper = ({ value, onInc, onDec, label, unit = "", icon: Icon }) => (
  <div className={styles.stepperContainer}>
    {label && (
      <div className={styles.stepperLabelWrapper}>
      {Icon && <span className={styles.stepperIcon}>{Icon}</span>}
    <span className="text-[12px] text-slate-400 font-bold">{label}</span>
      </div>
    )}
    <div className="flex items-center gap-3">
      <button onClick={onDec} className={styles.stepperBtn}>
        <Minus size={14} />
      </button>
      <div className="min-w-[40px] text-center font-black text-slate-800">
        {value} <span className="text-[8px] font-normal text-slate-400">{unit}</span>
      </div>
      <button onClick={onInc} className={styles.stepperBtn}>
        <Plus size={14} />
      </button>
    </div>
  </div>
);

export default Stepper;
