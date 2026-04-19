import axios from 'axios';

// هنا Vite يسحب الرابط من ملف .env تلقائياً
const API_URL = import.meta.env.VITE_API_BASE_URL || '';

export const sendReportToEmail = async (results) => {
    // سيصبح الرابط هنا: http://localhost:5000/api/send-report
    return await axios.post(`${API_URL}/api/send-report`, results);
};
