
import axios from 'axios';
import React, { useState } from 'react'; 

// أضف Loader2 هنا
import { SolarPanel, Battery, Zap, LayoutDashboard, Share2, Loader2 } from 'lucide-react'; 

import styles from './calculator.module.css';
import { sendReportToEmail } from '../api'; 
// مكون فرعي داخلي للنتائج
function ResultItem({ icon, label, value, unit, colorClass, bgClass, brand= null }) {
  return (
    // أضفنا flex و justify-between لضمان توزيع العناصر على الأطراف
    <div className={`${styles.itemBox} flex items-center justify-between w-full`}>
      
      {/* القسم الأيمن: يحتوي الأيقونة والنصوص */}
      <div className="flex items-center gap-3">
        <div className={`${styles.iconWrapper} ${bgClass} ${colorClass}`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <div>
          <p className={styles.label}>{label}</p>
          <p className={styles.value}>
            {value} <span className={styles.unit}>{unit}</span>
          </p>
        </div>
      </div>

      {/* القسم الأيسر: يظهر فيه اسم الماركة فقط */}
      {brand && (
        <div className="text-left">
          <span className="text-[10px] font-bold text-emerald-400/60 uppercase border-l border-emerald-500/20 pl-2">
            {brand}
          </span>
        </div>
      )}
      
    </div>
  );
}

function SolarCalculator({ results }) { const [isLoading, setIsLoading] = useState(false);
  // 2. الحماية من الخطأ: التأكد من وجود results قبل القراءة
  const hasResults = results && results.panels > 0;
  // استخراج بيانات العميل من داخل results التي أرسلناها من الفورم
  const client = results?.customerInfo;

const handleWhatsApp = async () => {
  if (!hasResults) return;
  setIsLoading(true);
  const phoneNumber = "967783265111";
  
  // جلب رابط السيرفر من متغيرات البيئة (في Vite)
  // سيعود بـ http://localhost:5000 في تيرمكس وفارغ "" في فيرسل
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const deviceLabels = {
    lights: 'لمبات LED',
    fans: 'مراوح',
    tvs: 'شاشة',
    washers: 'غسالة',
    fridges: 'ثلاجة',
    ac_1ton: 'مكيف طن (إنفرتر)',
    ac_1_5ton: 'مكيف طن ونص (إنفرتر)'
  };

  const devicesList = Object.entries(results.selectedDevices || {}).map(([id, dev]) => {
    const totalPower = dev.count * dev.power;
    const deviceName = deviceLabels[id] || id; 
    const dH = dev.dayHours || 0;
    const nH = dev.nightHours || 0;
    const totalHoursPower = totalPower * (dH + nH);
    const totalHours = dH + nH;
    return `◈_ ${deviceName}: العدد ${dev.count} ، القدرة ${totalPower}W\n` +
           `• _ عدد الساعات: ${totalHours}س (${dH}ن / ${nH}س)\n` +
           `• _ اجمالي الاستهلاك: ${totalHoursPower}Wh`;
  }).join('\n\n');

  const whatsappMessage = `السلام عليكم شركة Land Solar،
أنا العميل: ${results.customerInfo?.name || 'غير محدد'}
لقد قمت بعمل تحليل للمنظومة عبر تطبيقكم.
رقم الطلب الخاص بي هو: *${results.orderId}*
أرجو تزويدي بعرض السعر الرسمي المناسب.`;


  try {
    // إرسال الطلب للسيرفر (سيستخدم الرابط المحلي في التطوير والنسبي في النشر)
    await axios.post(`${API_BASE_URL}/api/send-report`, results);
    console.log("تمت أرشفة الطلب بنجاح"); 
     alert(`تم استلام طلبك بنجاح! \nرقم الطلب: ${results.orderId} \n\nسيتم الآن تحويلك لخدمة العملاء عبر الواتساب، يرجى إرسال الرسالة التي ستظهر لك.`);
  
       const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error("فشل إرسال الإيميل/الأرشفة، سيتم التحويل للواتساب مباشرة:", error);
     alert("حدث خطأ في أرشفة الطلب، لكن يمكنك التواصل معنا مباشرة عبر الواتساب.");
     const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, '_blank');
  } finally {
    // فتح الواتساب في نافذة جديدة
    setIsLoading(false);
  }
};

  return (
    <div className={styles.resultsCard}>
      <div className={styles.glow}></div>
      
      <h3 className={styles.header}>
        <LayoutDashboard size={20} className="text-[#00a896]" /> تحليل المنظومة المقترحة
      </h3>
      
      <div className={styles.itemsContainer}>
        <ResultItem 
          icon={<SolarPanel />} 
          label="عدد الألواح" 
          value={hasResults ? results.panels : "--"} 
          brand={hasResults ? results.panelName : null}
          unit="ألواح" 
          colorClass="text-emerald-400" 
          bgClass="bg-emerald-500/10" 
        />
        <ResultItem 
          icon={<Zap />} 
          label="حجم الإنفرتر" 
          value={hasResults ? results.inverterProductValue : "--"} 
brand={hasResults ? results.inverterName : null}
          unit="kW" 
          colorClass="text-emerald-400" 
          bgClass="bg-emerald-500/10" 
        />
        <ResultItem 
          icon={<Battery />} 
          label="سعة تخزين LiFePO4" 
          value={hasResults ? results.batteryKwh : "--"} 
         brand={hasResults ? results.batteryName : null}
          unit="kWh" 
          colorClass="text-emerald-400" 
          bgClass="bg-emerald-500/10" 
        />
      </div>

      {hasResults && (
        <div className={styles.footerActions}>
          <button className={styles.btnQuote}
          onClick={handleWhatsApp}
          disabled={isLoading}> {isLoading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="animate-spin" size={18} />
                جاري معالجة طلبك...
              </span>
            ) : (
              'طلب عرض سعر رسمي'
            )}
          
            
          </button>
          <button className="w-full bg-emerald-900/40 text-emerald-100 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-emerald-700/30">
            <Share2 size={16} /> مشاركة التقرير
          </button>
        </div>
      )}
    </div>
  );
}

export default SolarCalculator;
