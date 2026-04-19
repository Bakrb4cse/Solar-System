import axios from 'axios';

// في بيئة Vercel، نترك المسار فارغاً ليعتمد المتصفح على الرابط الحالي للموقع
// في بيئة التطوير المحلي، سيستخدم القيمة الموجودة في ملف .env إن وجدت
const API_URL = import.meta.env.VITE_API_BASE_URL || '';

export const sendReportToEmail = async (results) => {
    // التعديل: استخدام مسار نسبي يبدأ بـ /api ليتوافق مع إعدادات vercel.json
    // سيتحول الطلب تلقائياً من (your-site.vercel.app/api/send-report) 
    // إلى السيرفر الخاص بك داخلياً
    return await axios.post(`${API_URL}/api/send-report`, results);
};
