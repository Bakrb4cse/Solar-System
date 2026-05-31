import React from 'react';
import styles from './ui.module.css';

const InputGroup = ({ icon: Icon, placeholder, value, onChange, type = "text", options = [] }) => {
  
  // إذا كان النوع select، نعرض قائمة منسدلة
  if (type === 'select') {
    return (
      <div className={styles.inputWrapper}>
        {Icon && <Icon className={styles.inputIcon} size={18} />}
        <select 
          className={styles.selectField} 
          value={value} 
          onChange={onChange}
        >
          <option value="" disabled>{placeholder || 'اختر المنطقة'}</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.name}>
              {opt.name} ({opt.region}) - {opt.peakSunHours} ساعة
            </option>
          ))}
        </select>
      </div>
    );
  }

  // النوع العادي (text, number, email, etc.)
  return (
    <div className={styles.inputWrapper}>
      {Icon && <Icon className={styles.inputIcon} size={18} />}
      <input 
        type={type}
        placeholder={placeholder} 
        className={styles.inputField} 
        value={value} 
        onChange={onChange} 
      />
    </div>
  );
};

export default InputGroup;