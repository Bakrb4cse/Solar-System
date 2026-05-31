import { solarData } from '../constants/data'; 
import { getPeakSunHoursByLocation } from '../constants/locations';

// ثوابت النظام الأساسية
const SYSTEM_EFFICIENCY = 0.88;
const SAFETY_FACTOR = 1.15;
const BATTERY_EFFICIENCY = 0.9;
const BATTERY_DOD = 0.9;
const INVERTER_SAFETY = 1.2;
const DIVERSITY_FACTOR = 0.85;

// دالة تنظيف واستخراج الأرقام من النصوص (مثال: "3.5KWH" تتحول إلى 3.5)
const parseCapacity = (capValue) => {
  if (typeof capValue === 'number') return capValue;
  if (!capValue) return 0;
  const num = parseFloat(String(capValue).replace(/[^\d.]/g, ''));
  return isNaN(num) ? 0 : num;
};

// 🛠️ اختيار الإنفرتر المناسب بناءً على الحمل والألواح ونظام التوازي
const findBestInverter = (requiredInvSize, totalPVWattage, systemVoltage = 48) => {
  const voltageInverters = solarData.inverters.filter(inv => Number(inv.batteryVoltage) === systemVoltage);
  const targetInverters = voltageInverters.length > 0 ? voltageInverters : solarData.inverters;

  const sortedInverters = [...targetInverters].sort((a, b) => 
    parseCapacity(a.capacity) - parseCapacity(b.capacity)
  );

  // 1) البحث عن إنفرتر منفرد يلبي كامل الاحتياج
  let matched = sortedInverters.find(inv => 
    parseCapacity(inv.capacity) >= requiredInvSize &&
    (inv.maxSolarPower || 0) >= totalPVWattage
  );

  if (matched) {
    return { inverter: matched, count: 1 };
  }

  // 2) نظام التوازي عند العجز عن إيجاد إنفرتر منفرد ضخم
  const largestInverter = sortedInverters[sortedInverters.length - 1] || solarData.inverters[0];
  const largestCap = parseCapacity(largestInverter.capacity) || 5;
  const largestSolar = largestInverter.maxSolarPower || 5000;

  const countByLoad = Math.ceil(requiredInvSize / largestCap);
  const countBySolar = Math.ceil(totalPVWattage / largestSolar);
  const inverterCount = Math.max(countByLoad, countBySolar, 1);

  return { inverter: largestInverter, count: inverterCount };
};
// 🔋 اختيار البطارية المناسبة (نسخة محسنة)
const findBestBattery = (requiredBattSize, systemVoltage = 48) => {

  // فلترة البطاريات حسب فولتية النظام
  const voltageBatteries = solarData.batteries.filter(
    b => Number(b.voltage) === systemVoltage
  );

  const targetBatteries =
    voltageBatteries.length > 0
      ? voltageBatteries
      : solarData.batteries;

  // ترتيب تصاعدي حسب السعة
  const sortedBatteries = [...targetBatteries].sort(
    (a, b) =>
      parseCapacity(a.capacity) -
      parseCapacity(b.capacity)
  );

  const largestCapacity =
    parseCapacity(
      sortedBatteries[sortedBatteries.length - 1].capacity
    );

  const uniqueCapacities = [
    ...new Set(
      sortedBatteries.map(b =>
        parseCapacity(b.capacity)
      )
    )
  ].sort((a, b) => a - b);

  // ============================================================
  // الشرط الأول: بطارية واحدة تكفي
  // ============================================================
  if (requiredBattSize <= largestCapacity) {

    const matched = sortedBatteries.find(
      b => parseCapacity(b.capacity) >= requiredBattSize
    );

    if (matched) {
      return {
        battery: matched,
        count: 1
      };
    }
  }

  // ============================================================
  // الشرط الثاني: تجميع ذكي كامل
  // ============================================================

  let bestOption = null;

  // يمكن رفع الرقم لاحقاً حسب سياسة الشركة
  const maxBatteries = 12;

  for (let num = 2; num <= maxBatteries; num++) {

    for (const cap of uniqueCapacities) {

      const totalCapacity = cap * num;

      // استبعاد أي خيار أقل من الاحتياج
      if (totalCapacity < requiredBattSize) {
        continue;
      }

      const batteryObj = sortedBatteries.find(
        b => parseCapacity(b.capacity) === cap
      );

      if (!batteryObj) continue;

      const surplus =
        totalCapacity - requiredBattSize;

      const totalPrice =
        (batteryObj.price || 0) * num;

      const option = {
        count: num,
        battery: batteryObj,
        totalCapacity,
        surplus,
        totalPrice
      };

      // أول خيار صالح
      if (!bestOption) {
        bestOption = option;
        continue;
      }

      // ====================================================
      // الأولوية 1 : أقل زيادة فوق الاحتياج
      // ====================================================
      if (option.surplus < bestOption.surplus) {
        bestOption = option;
        continue;
      }

      // ====================================================
      // الأولوية 2 : أقل عدد بطاريات
      // ====================================================
      if (
        option.surplus === bestOption.surplus &&
        option.count < bestOption.count
      ) {
        bestOption = option;
        continue;
      }

      // ====================================================
      // الأولوية 3 : أقل تكلفة
      // ====================================================
      if (
        option.surplus === bestOption.surplus &&
        option.count === bestOption.count &&
        option.totalPrice < bestOption.totalPrice
      ) {
        bestOption = option;
      }
    }
  }

  // ============================================================
  // حماية إضافية
  // ============================================================
  if (!bestOption) {

    const largestBattery =
      sortedBatteries[sortedBatteries.length - 1];

    const largestCap =
      parseCapacity(largestBattery.capacity);

    const count = Math.ceil(
      requiredBattSize / largestCap
    );

    return {
      battery: largestBattery,
      count
    };
  }

  return {
    battery: bestOption.battery,
    count: bestOption.count
  };
};

// 🚀 الدالة الرئيسية لحساب المنظومة بالكامل
export const calculateSolarSystem = (selectedDevices, panelPower, locationName = 'المنصورة') => {
  let dayEnergyWh = 0, nightEnergyWh = 0, maxPeakLoad = 0;
 

  // 1️⃣ حساب استهلاك الأجهزة الفعلي من الواجهة
  Object.values(selectedDevices).forEach(device => {
    const dayCount = Number(device.dayCount) || 0;
    const nightCount = Number(device.nightCount) || 0;
    const dayPower = Number(device.dayPower) || Number(device.power) || 0;
    const nightPower = Number(device.nightPower) || Number(device.power) || 0;
    const dayHours = Number(device.dayHours) || 0;
    const nightHours = Number(device.nightHours) || 0;

    const dayPeak = dayCount * dayPower;
    const nightPeak = nightCount * nightPower;
    maxPeakLoad += Math.max(dayPeak, nightPeak);

    dayEnergyWh += dayCount * dayPower * dayHours;
    nightEnergyWh += nightCount * nightPower * nightHours;
  });
   /* console.log('═══════════════════════════════════════');
console.log('📊 [SOLAR CALCULATIONS] نتائج الأحمال:');
console.log('═══════════════════════════════════════');
console.log(`🔹 إجمالي أحمال النهار (Day)   : ${Math.round(dayEnergyWh).toLocaleString()} Wh`);
console.log(`🔸 إجمالي أحمال المساء (Night) : ${Math.round(nightEnergyWh).toLocaleString()} Wh`);
console.log(`🔺 إجمالي أحمال الذروة (Peak)  : ${Math.round(maxPeakLoad).toLocaleString()} W`);
console.log('═══════════════════════════════════════'); */
  const totalDailyEnergy = dayEnergyWh + nightEnergyWh;
  const peakSunHours = getPeakSunHoursByLocation(locationName);
  const panelsNeeded = Math.ceil(
    (totalDailyEnergy * SAFETY_FACTOR) / (panelPower * peakSunHours * SYSTEM_EFFICIENCY)
  );
  const totalPVWattage = panelsNeeded * panelPower;

  const adjustedPeakLoad = maxPeakLoad * DIVERSITY_FACTOR;
  const invSizeKva = (adjustedPeakLoad * INVERTER_SAFETY) / 1000;
  const systemVoltage = invSizeKva <= 2.5 ? 24 : 48;

  // حساب سعة التخزين الصافية المطلوبة للبطارية بالكيلوواط
  const finalBatteryKwh = nightEnergyWh > 0 
    ? Math.max((nightEnergyWh / 1000) / (BATTERY_EFFICIENCY * BATTERY_DOD), 2.5)
    : 2.5;

  // 2️⃣ استدعاء دوال الاختيار الذكية والمطابقة لملف الداتا
  const { inverter: selectedInverter, count: inverterCount } = findBestInverter(invSizeKva, totalPVWattage, systemVoltage);
  const { battery: selectedBattery, count: batteryCount } = findBestBattery(finalBatteryKwh, systemVoltage);
  
  const singleBatteryCap = parseCapacity(selectedBattery.capacity) || 3.5;
  const totalBatteryKwh = batteryCount * singleBatteryCap;

  const orderId = `LS-${String(Math.floor(Math.random() * 999999) + 1).padStart(6, '0')}`;

  // 3️⃣ إرجاع الكائن الكامل مع الحفاظ على جميع الحقول الأصلية دون نقصان لسلامة الـ UI
  return {
    orderId,
    panels: panelsNeeded,
    
    // 📊 حقول الإنفرتر كاملة ومطابقة لملفك الأصلي
    inverterProductValue: parseCapacity(selectedInverter.capacity) * inverterCount,
    inverterSingleValue: parseCapacity(selectedInverter.capacity),
    inverterActualNeed: invSizeKva.toFixed(2),
    inverterBrand: selectedInverter.brand,
    inverterName: inverterCount > 1 ? `${selectedInverter.name} (عدد: ${inverterCount})` : selectedInverter.name,
    inverterPrice: selectedInverter.price * inverterCount,
    inverterCount: inverterCount,
    
    // 🔋 حقول بنك البطاريات كاملة ومطابقة لملفك الأصلي
    batteryKwh: totalBatteryKwh,                       
    batterySingleKwh: singleBatteryCap,                 
    batteryPrice: selectedBattery.price * batteryCount, 
    batteryName: batteryCount > 1 ? `${selectedBattery.name} (عدد: ${batteryCount})` : selectedBattery.name,
    batteryCount: batteryCount,
    batteries: batteryCount, // الحفاظ عليه كعدد البطاريات الفعلي لمنع تجميد أو لخبطة الـ UI
    
    // بقية البيانات العامة للمنظومة
    totalEnergy: totalDailyEnergy,
    peakLoad: (maxPeakLoad / 1000).toFixed(2),
    panelName: solarData.solarPanels.find(p => parseCapacity(p.capacity) === panelPower)?.name || `${panelPower}W`,
    panelPrice: solarData.solarPanels.find(p => parseCapacity(p.capacity) === panelPower)?.price,
    panelCapacity: `${panelPower}W`,
    dayEnergyWh: Math.round(dayEnergyWh),
    nightEnergyWh: Math.round(nightEnergyWh),
    actualLoadKwh: (totalDailyEnergy / 1000).toFixed(2),
    peakLoadKw: (maxPeakLoad / 1000).toFixed(2),
    systemVoltage,
    selectedDevices

  };

};