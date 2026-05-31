import React from 'react';
import { User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import InputGroup from './ui/InputGroup';
import Button from './ui/Button';
import { LOCATIONS } from '../constants/locations';
import styles from './form.module.css';

const StepCustomerInfo = ({ customerInfo, setCustomerInfo, onNext }) => {
  
  // دالة للتحقق من إدخال البيانات الأساسية قبل الانتقال
  const handleNext = () => {
    if (customerInfo.name && customerInfo.phone && customerInfo.address) {
      onNext();
    } else {
      alert("يرجى إدخال الاسم ورقم الجوال والمنطقة للمتابعة");
    }
  };

  return (
    <div className={styles.stepCard}>
      <h3 className={styles.title}>
        <User size={20} className={styles.titleIcon} /> معلومات العميل
      </h3>

      <div className={styles.inputContainer}>
        <InputGroup 
          icon={User}
          placeholder="الاسم الكامل"
          value={customerInfo.name}
          onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
        />

        <InputGroup 
          icon={Phone}
          type="number"
          placeholder="رقم الجوال"
          value={customerInfo.phone}
          onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
        />

        <InputGroup 
          icon={MapPin}
          type="select"
          placeholder="اختر المنطقة"
          value={customerInfo.address}
          onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
          options={LOCATIONS}
        />
      </div>

      <div className={styles.footer}>
        <Button 
          onClick={handleNext} 
          variant="amber" 
          icon={ArrowLeft}
        >
          متابعة لاختيار الأجهزة
        </Button>
      </div>
    </div>
  );
};

export default StepCustomerInfo;