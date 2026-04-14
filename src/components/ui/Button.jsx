import React from 'react';
import styles from './ui.module.css';

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon }) => {
  const variantClass = styles[variant] || styles.primary;

  return (
    <button onClick={onClick} className={`${styles.btnBase} ${variantClass} ${className}`}>
      {children}
      {Icon && <Icon size={20} />}
    </button>
  );
};

export default Button;
