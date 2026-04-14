import { solarData } from '../constants/data'; 

/**
 * وظيفة اختيار أفضل إنفرتر مطابق من مصفوفة البيانات
 * تم تحديثها لتشمل فحص قدرة الألواح القصوى (maxSolarPower) بجانب سعة الـ AC
 */
const findBestInverter = (requiredSize, totalPanelsWattage) => {
  const inverters = solarData.inverters;
  
  const parseCapacity = (capStr) => {
    const num = parseFloat(capStr.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  // 1. ترتيب الإنفرترات تصاعدياً حسب السعر لضمان أفضل خيار اقتصادي
  const sortedInverters = [...inverters].sort((a, b) => a.price - b.price);

  // 2. البحث عن أول جهاز يغطي الاحتياج (حجم الإنفرتر + قدرة الألواح)
  let matched = sortedInverters.find(inv => 
    parseCapacity(inv.capacity) >= requiredSize && 
    inv.maxSolarPower >= totalPanelsWattage
  );

  // 3. اختيار الأكبر في حال تجاوز الاحتياج كل الخيارات
  if (!matched) {
    matched = sortedInverters[sortedInverters.length - 1];
  }

  return matched;
};

/**
 * الدالة الرئيسية لحسابات المنظومة الشمسية
 */
export const calculateSolarSystem = (selectedDevices, panelPower) => {
  let dayEnergyWh = 0;    
  let nightEnergyWh = 0;  
  let maxPeakLoad = 0;    

  // حساب الاستهلاك بناءً على الأجهزة المختارة (نفس المنطق الأصلي)
  Object.values(selectedDevices).forEach(device => {
    const deviceTotalPower = device.count * device.power;
    
    const dayWh = deviceTotalPower * (Number(device.dayHours) || 0);
    const nightWh = deviceTotalPower * (Number(device.nightHours) || 0);

    dayEnergyWh += dayWh;
    nightEnergyWh += nightWh;
    maxPeakLoad += deviceTotalPower;
  });

  const totalDailyEnergy = dayEnergyWh + nightEnergyWh;

  // 1. حساب الألواح (6 ساعات ذروة مع معامل فقد 0.88)
  const totalEnergyRequired = totalDailyEnergy * 1.15;
  const panelsNeeded = Math.ceil(totalEnergyRequired / (panelPower * 6 * 0.88));
  const totalPVWattage = panelsNeeded * panelPower;

  // 2. حساب حجم الإنفرتر (النظري + اختيار المنتج)
  const theoreticalInverterSizeKva = (maxPeakLoad * 1.2) / 1000;
  
  // استدعاء الفلترة مع تمرير واط الألواح لضمان عدم تجاوز قدرة المنظم
  const selectedInverter = findBestInverter(theoreticalInverterSizeKva, totalPVWattage);
  
  const productValueOnly = parseFloat(selectedInverter.capacity.replace(/[^\d.]/g, ''));

  // البحث عن كائن اللوح لجلب اسمه المختصر
  const selectedPanelObj = solarData.solarPanels.find(p => parseFloat(p.capacity) === panelPower);

  // 3. حساب سعة البطارية (LiFePO4)
  const calculatedBattery = (nightEnergyWh / 1000) / (0.9 * 0.9);
  const minBattery = 2.5; 

  const finalBatteryKwh = nightEnergyWh > 0 
    ? Math.max(calculatedBattery, minBattery) 
    : minBattery;

  // إرجاع النتائج النهائية مع الحفاظ على كل المتغيرات القديمة وإضافة الجديدة
  return {
    // المتغيرات الأصلية (لم يتم حذف أي منها)
    panels: panelsNeeded,
    inverterProductValue: productValueOnly, 
    inverterActualNeed: theoreticalInverterSizeKva.toFixed(2), 
    inverterBrand: selectedInverter.brand,
    inverterPrice: selectedInverter.price,
    inverterVoltage: selectedInverter.systemVoltage,
    batteries: parseFloat(finalBatteryKwh.toFixed(1)),
    totalEnergy: totalDailyEnergy,
    peakLoad: (maxPeakLoad / 1000).toFixed(2),

    // المتغيرات الجديدة المطلوبة للرسالة والواجهة
    panelName: selectedPanelObj ? selectedPanelObj.name : `${panelPower}W`,
    inverterName: selectedInverter.name,
    dayEnergyWh: dayEnergyWh,
    nightEnergyWh: nightEnergyWh,
    actualLoadKwh: (totalDailyEnergy / 1000).toFixed(2),
    peakLoadKw: (maxPeakLoad / 1000).toFixed(2)
  };
};
