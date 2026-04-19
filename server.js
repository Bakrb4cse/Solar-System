import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
// استيراد الدوال التي أنشأناها (تأكد من إضافة .js في النهاية)
import generateSolarPDF from './src/utils/pdfGenerator.js';
import sendEmailReport from './src/utils/mailer.js';

const app = express();

// إعداد __dirname يدوياً لأنها غير موجودة في ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. تفعيل dotenv (هنا كان الخطأ، يجب أن تكون بعد import مباشرة)
dotenv.config({ path: path.join(__dirname, '.env') });

// اختبار الطباعة للتأكد من قراءة الملف

app.use(cors());
app.use(express.json());
app.post('/api/send-report', async (req, res) => {
    try {
        const results = req.body;
        
        // استخدام المجلد المؤقت لـ Vercel
        

     const tempDir = process.env.VERCEL ? '/tmp' : path.join(__dirname, 'temp');

// تعديل سطر الـ outputPath داخل الـ post:
const outputPath = path.join(tempDir, `solar-report-${Date.now()}.pdf`);
        // 1. إنشاء الـ PDF
        await generateSolarPDF(results, outputPath);

        // 2. إرسال الإيميل (إلى بريد الشركة المخزن في env)
        await sendEmailReport(
            process.env.COMPANY_MAIN_EMAIL, 
            outputPath, 
            results.customerInfo?.name || 'Customer'
        );

        // 3. مسح الملف المؤقت فوراً بعد الإرسال
        if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
        }

        res.status(200).json({ 
            success: true, 
            message: 'تم إرسال التقرير بنجاح وأرشفته' 
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }

});

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server is fired up!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📂 Ready to archive solar reports...\n`);
});

export default app;
