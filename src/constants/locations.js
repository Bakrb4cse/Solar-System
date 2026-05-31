// src/constants/locations.js

export const LOCATIONS = [
  { id: 1, name: 'المنصورة', region: 'عدن', peakSunHours: 6.0 },
  { id: 2, name: 'خور مكسر', region: 'عدن', peakSunHours: 6.0 },
  { id: 3, name: 'كريتر', region: 'عدن', peakSunHours: 6.0 },
  { id: 4, name: 'الشيخ عثمان', region: 'عدن', peakSunHours: 5.9 },
  { id: 5, name: 'البريقة', region: 'عدن', peakSunHours: 6.0 },
  { id: 6, name: 'دار سعد', region: 'عدن', peakSunHours: 5.9 },
  { id: 7, name: 'التواهي', region: 'عدن', peakSunHours: 6.0 },
  { id: 8, name: 'الفيوش', region: 'أبين', peakSunHours: 5.8 },
  { id: 9, name: 'الرباط', region: 'لحج', peakSunHours: 5.7 },
  { id: 10, name: 'المدينة الخضراء', region: 'عدن', peakSunHours: 6.0 },
  { id: 11, name: 'يافع', region: 'لحج', peakSunHours: 5.5 },
  { id: 12, name: 'لحج', region: 'لحج', peakSunHours: 5.7 },
];

// دالة مساعدة لجلب ساعات الذروة حسب اسم المنطقة
export const getPeakSunHoursByLocation = (locationName) => {
  const location = LOCATIONS.find(loc => loc.name === locationName);
  return location ? location.peakSunHours : 6.0; // القيمة الافتراضية 6 ساعات
};

// دالة مساعدة لجلب اسم المنطقة
export const getLocationName = (locationName) => {
  const location = LOCATIONS.find(loc => loc.name === locationName);
  return location ? location.name : locationName;
};