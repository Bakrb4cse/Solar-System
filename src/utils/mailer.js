import nodemailer from 'nodemailer';

const sendEmailReport = async (customerEmail, pdfPath, customerName) => {
  // 1. إعداد "الناقل" (بواسطة Gmail كمثال)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // إيميل الشركة
      pass: process.env.EMAIL_PASS, // كلمة مرور التطبيقات (App Password)
    },
  });

  // 2. إعداد محتوى الرسالة
  const mailOptions = {
    from: `"Solar System" <${process.env.EMAIL_USER}>`,
    to: process.env.COMPANY_MAIN_EMAIL, // الإيميل الذي ستستلم فيه الشركة التقارير
    subject: `طلب عرض سعر جديد - العميل: ${customerName}`,
    text: `تم إنشاء تقرير تحجيم جديد للعميل ${customerName}. تجدون التقرير المفصل في المرفقات.`,
    attachments: [
      {
        filename: `Solar_Report_${customerName}.pdf`,
        path: pdfPath, // مسار ملف الـ PDF الذي سينشئه ملف pdfGenerator
      },
    ],
  };

  // 3. الإرسال الفعلي
  return transporter.sendMail(mailOptions);
};

// ... الكود ...
export default sendEmailReport;
