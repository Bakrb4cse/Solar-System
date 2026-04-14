import React from 'react';
import { Zap, Sun, Moon, ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import Stepper from './ui/Stepper';
import Button from './ui/Button';
import { PREDEFINED_DEVICES } from '../constants/devices';
import styles from './step.module.css';

const StepDeviceList = ({ selectedStandard, setSelectedStandard, onNext, onBack }) => {
  
  const updateValue = (deviceId, field, delta) => {
    const currentVal = selectedStandard[deviceId][field] || 0;
    const newVal = Math.max(0, currentVal + delta);
    setSelectedStandard(prev => ({
      ...prev,
      [deviceId]: { ...prev[deviceId], [field]: newVal }
    }));
  };

  const toggleDevice = (device) => {
    setSelectedStandard(prev => {
      if (prev[device.id]) {
        const next = { ...prev };
        delete next[device.id];
        return next;
      }
      return {
        ...prev,
        [device.id]: {
          count: 1,
          power: device.defaultPower,
          dayHours: device.nightOnly ? 0 : 6,
          nightHours: device.id === 'lights' ? 12 : 6
        }
      };
    });
  };

  return (
    <div className={styles.stepCard}>
      <h3 className={styles.title}>
        <Zap size={20} className={styles.titleIcon} /> اختيار الأجهزة والأحمال
      </h3>

      <div className={styles.deviceGrid}>
        {PREDEFINED_DEVICES.map((device) => (
          <div 
            key={device.id} 
            className={`${styles.deviceCard} ${selectedStandard[device.id] ? styles.deviceCardActive : ''}`}
          >
            {/* الرأس: للنقر لتفعيل الجهاز */}
            <div className={styles.deviceHeader} onClick={() => toggleDevice(device)}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedStandard[device.id] ? 'bg-[#f28100] text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Zap size={18} />
                </div>
                <span className={`font-bold text-sm ${selectedStandard[device.id] ? 'text-slate-900' : 'text-slate-500'}`}>
                  {device.label}
                </span>
              </div>
              
              {selectedStandard[device.id] && (
                <div className={styles.powerBadge}>
                  <button onClick={(e) => { e.stopPropagation(); updateValue(device.id, 'power', -10); }}><Minus size={12}/></button>
                  <span>{selectedStandard[device.id].power}W</span>
                  <button onClick={(e) => { e.stopPropagation(); updateValue(device.id, 'power', 10); }}><Plus size={12}/></button>
                </div>
              )}
            </div>

            {/* التحكم: يظهر فقط إذا تم اختيار الجهاز */}
            {selectedStandard[device.id] && (
              <div className={styles.deviceControls}>
                <Stepper 
                  label="العدد" 
                  value={selectedStandard[device.id].count} 
                  onInc={() => updateValue(device.id, 'count', 1)} 
                  onDec={() => updateValue(device.id, 'count', -1)} 
                />
                <div className="grid grid-cols-2 gap-3">
                  {!device.nightOnly && (
    <Stepper 
      label="ساعات نهاراً" 
      unit="س" 
      icon={
        <Sun size={19} className={styles.dayColor}/>
           }
                      value={selectedStandard[device.id].dayHours} 
                      onInc={() => updateValue(device.id, 'dayHours', 1)} 
                      onDec={() => updateValue(device.id, 'dayHours', -1)} 
                    />
                  )}
                  <Stepper 
                    label="ساعات ليلاً"
                    unit="س" 
                    icon={
        <Moon size={19} className={styles.nightColor}/>
           }
                    value={selectedStandard[device.id].nightHours} 
                    onInc={() => updateValue(device.id, 'nightHours', 1)} 
                    onDec={() => updateValue(device.id, 'nightHours', -1)} 
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <Button onClick={onBack}  icon={ArrowRight}
        variant="secondary" > السابق
        </Button>
        <Button onClick={onNext} variant="amber" icon={ArrowLeft}>التالي</Button>
      </div>
    </div>
  );
};

export default StepDeviceList;
