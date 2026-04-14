import React from 'react';
import styles from './ui.module.css';

const InputGroup = ({ icon: Icon, placeholder, value, onChange, type = "text" }) => (
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

export default InputGroup;
