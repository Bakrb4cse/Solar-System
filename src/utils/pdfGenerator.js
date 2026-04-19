import pdfmake from 'pdfmake';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تسميات الأجهزة بالعربية
const deviceLabels = {
  'lights': 'لمبات LED',
  'fans': 'مراوح',
  'tvs': 'شاشات',
  'washers': 'غسالة',
  'fridges': 'ثلاجات',
  'ac_1ton': 'مكيف طن (إنفرتر)',
  'ac_1_5ton': 'مكيف طن ونص (إنفرتر)',
  'modem': 'مودم',
  'router': 'راوتر',
  'pump': 'مضخة مياه',
  'heater': 'سخان كهربائي',
  'microwave': 'ميكروويف'
};

// الحصول على اسم الجهاز بالعربية
const getDeviceLabel = (key) => {
  return deviceLabels[key] || key.replace(/_/g, ' ');
};

// دالة حساب استهلاك جهاز
const calcDeviceConsumption = (device) => {
  if (!device) return { day: 0, night: 0, total: 0 };
  const dayCons = (device.count || 0) * (device.power || 0) * (device.dayHours || 0);
  const nightCons = (device.count || 0) * (device.power || 0) * (device.nightHours || 0);
  return { day: dayCons, night: nightCons, total: dayCons + nightCons };
};

const generateSolarPDF = (results, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // تعريف الخطوط العربية
      const fontPath = path.join(__dirname, '../assets/fonts/Amiri.ttf');

      const fonts = {
        Amiri: {
          normal: fontPath,
          bold: fontPath,
          italics: fontPath,
          bolditalics: fontPath
        }
      };

      const printer = new pdfmake(fonts);

      // الحصول على بيانات العميل
      const customer = results.customerInfo || {};
      const devices = results.selectedDevices || {};
      const deviceEntries = Object.entries(devices);

     // تعريف الأسعار من الكائن results أو وضع قيم افتراضية لتجنب الـ NaN
const pPrice = results.panelPrice || 105;
const iPrice = results.inverterPrice || 0;
const bPrice = results.batteryPrice || 0;

// حساب إجمالي كل صنف (الكمية × السعر)
let totalPanelsPrice = (results.panels || 0) * pPrice;
let totalInverterPrice = 1 * iPrice; // عادة قطعة واحدة
let totalBatteriesPrice = 1 * bPrice; // أو ضربها في results.batteries إذا وجد

// الآن يمكنك جمع الإجمالي الكلي دون أخطاء
let totalPrice = totalPanelsPrice + totalInverterPrice + totalBatteriesPrice;

 



      // حساب إجمالي الطاقة
      let totalDayEnergy = 0;
      let totalNightEnergy = 0;
      let totalEnergy = 0;
      
     

      const deviceRows = [];

      deviceEntries.forEach(([key, device]) => {
        const consumption = calcDeviceConsumption(device);
        totalDayEnergy += consumption.day;
        totalNightEnergy += consumption.night;
        totalEnergy += consumption.total;

        deviceRows.push([
  { text: consumption.total.toString(), alignment: 'center' },        // 1- الإجمالي
  { text: consumption.night.toString(), alignment: 'center' },        // 2- استهلاك المساء
  { text: consumption.day.toString(), alignment: 'center' },          // 3- استهلاك النهار
  { text: `${device.dayHours || 0}/${device.nightHours || 0}`, alignment: 'center' }, // 4- الساعات
  { text: device.power?.toString() || '0', alignment: 'center' },     // 5- القدرة
  { text: device.count?.toString() || '0', alignment: 'center' },     // 6- العدد
  { text: getDeviceLabel(key), alignment: 'right' }                   // 7- الصنف
]);

      });

      // إضافة صف فارغ إذا لم توجد أجهزة
      if (deviceRows.length === 0) {
        deviceRows.push([
          { text: 'لا توجد أجهزة مسجلة', alignment: 'center', colSpan: 7 },
          {}, {}, {}, {}, {}, {}
        ]);
      }

      // استخدام القيم من results إذا كانت موجودة
      const finalDayEnergy = results.dayEnergyWh || totalDayEnergy;
      const finalNightEnergy = results.nightEnergyWh || totalNightEnergy;
      const finalPeakLoad = results.peakLoadKw || (totalEnergy / 1000);

      // تاريخ اليوم
      const today = new Date();
      const arabicDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

      // إعدادات RTL العامة
      const docDefinition = {
        defaultStyle: {
          font: 'Amiri',
          fontSize: 10,
          alignment: 'right'
        },

        content: [
          // ====== الترويسة ======
       // ======= الجزء العلوي (الشعار + عنوان الشركة) =======
{
  columnGap: 10,
  columns: [
    // 1- معلومات التواصل على اليسار
    {
      width: '35%', // تم توحيد العرض هنا
      stack: [
        { text: 'عدن - المنصورة - خلف سوق الخضار - مقابل فندق ماسك', fontSize: 8, bold: true, color: '#229a0d', alignment: 'left' },
        { 
          stack: [
            { text: '783265111 :العملاء خدمة', fontSize: 8, bold: true, color: '#229a0d', alignment: 'left' },
            { text: '774276866 :مبيعات', fontSize: 8, bold: true, color: '#229a0d', alignment: 'left' }
            
          ],
          margin: [0, 4, 0, 0]
        }
      ],
      margin: [0, 8, 0, 0]
    },

    // 2- شعار الهيدر النصي في المنتصف
    {
      width: '*', 
      image: path.join(__dirname, '../../public/header.png'),
      // تم حذف تعريف width الثاني ودمجه هنا
      fit: [180, 60], // استخدام fit أفضل للتحكم في الأبعاد داخل الأعمدة
      alignment: 'center',
      margin: [0, 24, 8, 0]
    },

    // 3- الشعار المربع الأخضر على اليمين
    {
    
      image: path.join(__dirname, '../../public/logo.png'),
      width: 70, // تعريف واحد فقط
      alignment: 'right'
    }
  ],
  margin: [0, 10, 0, 15]
},



// ======= الخط الفاصل الأخضر =======
{ 
  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, color: '#007a3d' }], 
  margin: [0, 5, 0, 15] 
},

// ======= العنوان الرئيسي في المنتصف مع عكس الكلمات =======
{
  columns: [
    // 1- رقم الطلب في أقصى اليسار
    {
      text: '',
      width: '30%'
    },
    // 2- العنوان الرئيسي في المنتصف
    {
      text: 'الشمسيه المنظومة تحجيم نتائج',
      fontSize: 20,
      bold: true,
      color: '#007a3d',
      alignment: 'center', // محاذاة للمنتصف
      width: '40%'
    },
    // 3- عمود فارغ في اليمين لموازنة التنسيق (اختياري)
   { stack: [
     {
     text: `${results.orderId || 'حدد يُ لم'} :الطلب رقم`, 
      fontSize: 11,
      color: '#666',
      bold: true,
      alignment: 'right', // محاذاة لليسار
      width: '30%', // تخصيص مساحة كافية
      margin: [0, 8, 0, 0] // إزاحة للأسفل قليلاً ليتوازى مع العنوان الكبير
    }
  ],
}
  ],
  margin: [0, 10, 0, 20]
},
 // ====== بطاقة معلومات العميل ======
 {
  stack: [
    // العنوان بالخارج كما طلبت مع عكس الكلمات
    { text: 'العميل معلومات', fontSize: 14, bold: true, color: '#007a3d', margin: [0, 0, 0, 10] },
    
    {
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                // قمنا بعكس ترتيب الاسم برمجياً ليعرض: بكر احمد عبده
                { text: `${(customer.name || 'محدد غير').split(' ').reverse().join(' ')} :الاسم :1`, alignment: 'right', margin: [0, 2, 0, 2] },
                { text: `${customer.phone || 'محدد غير'} :الجوال :2`, alignment: 'right', margin: [0, 2, 0, 2] },
                { text: `${customer.address || 'محدد غير'} :المنطقة :3`, alignment: 'right', margin: [0, 2, 0, 2] },
                { text: `${arabicDate} :الطلب تاريخ :4`, alignment: 'right', margin: [0, 2, 0, 0] }
              ],
              fillColor: '#F5F5DC', // لون بيج
              border: [false, false, false, false],
              borderRadius: 8,
              margin: [15, 10, 10, 10]
 // إخفاء حدود الجدول
            }
          ]
        ]
      },
      layout: 'noBorders' // التأكيد على إخفاء الحدود
    }
  ],
  margin: [0, 0, 0, 20]
},
// ======= العنوان الرئيسي مع عكس الكلمات =======
{ text: 'اليومي الاستهلاك تفاصيل جدول', fontSize: 14, bold: true, color: '#007a3d', margin: [0, 10, 0, 10] },

{
  table: {
    headerRows: 1,
    widths: [60, 60, 60, 60, 50, 40, '*'], 
    body: [
      [
        // تم عكس الكلمات داخل العناوين أيضاً
        { text: '(Wh) الإجمالي', style: 'tableHeader', alignment: 'center' },
        { text: 'المساء استهلاك', style: 'tableHeader', alignment: 'center' },
        { text: 'النهار استهلاك', style: 'tableHeader', alignment: 'center' },
        { text: '(ن/م) ساعات', style: 'tableHeader', alignment: 'center' },
        { text: '(W) القدرة', style: 'tableHeader', alignment: 'center' },
        { text: 'العدد', style: 'tableHeader', alignment: 'center' },
        { text: 'الصنف', style: 'tableHeader', alignment: 'center' }
      ],
      ...deviceRows 
    ]
  },
  layout: {
    fillColor: (rowIndex) => {
      return (rowIndex === 0) ? '#007a3d' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
    },
    hLineWidth: () => 0.5,
    vLineWidth: () => 0.5,
    hLineColor: () => '#ccc',
    vLineColor: () => '#ccc'
  },
  margin: [0, 0, 0, 20]
},

// ====== الصناديق الثلاثة (خلفية برتقالي فاتح + خط أخضر) ======
{
  columns: [
    {
      width: '32%',
      stack: [
        { text: 'الذروة أحمال', fontSize: 12, color: '#f28100', alignment: 'center', margin: [0, 10, 0, 5] },
        { text: `${parseFloat(finalPeakLoad).toFixed(2)} kW`, fontSize: 18, bold: true, color: '#f28100', alignment: 'center', margin: [0, 0, 0, 10] }
      ],
      margin: [0, 0, 5, 0],
      fillColor: '#fff3e6', // برتقالي فاتح جداً
      borderRadius: 5
    },
    {
      width: '32%',
      stack: [
        { text: 'النهاري إجمالي', fontSize: 12, color: '#f28100', alignment: 'center', margin: [0, 10, 0, 5] },
        { text: `${Math.round(finalDayEnergy)} Wh`, fontSize: 18, bold: true, color: '#f28100', alignment: 'center', margin: [0, 0, 0, 10] }
      ],
      margin: [0, 0, 5, 0],
      fillColor: '#fff3e6',
      borderRadius: 5
    },
    {
      width: '32%',
      stack: [
        { text: 'المسائي إجمالي', fontSize: 12, color: '#f28100', alignment: 'center', margin: [0, 10, 0, 5] },
        { text: `${Math.round(finalNightEnergy)} Wh`, fontSize: 18, bold: true, color: '#f28100', alignment: 'center', margin: [0, 0, 0, 10] }
      ],
      fillColor: '#fff3e6',
      borderRadius: 5
    }
  ],
  fillColor: '#a8ffaf', 
  margin: [0, 0, 0, 20]
},

// ======= الخط الفاصل الأخضر =======
{ 
  canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1.5, color: '#007a3d' }], 
  margin: [0, 5, 0, 15] 
},

          // ====== المقترحة المنظومة سعر عرض ======
          { text: 'المقترحة المنظومة سعر عرض', fontSize: 14, bold: true, color: '#007a3d', alignment: 'center', margin: [0, 10, 0, 10] },

          {
            table: {
              headerRows: 1,
              // تم ترتيب العروض: السعر، الكمية، الموديل، الاسم
              widths: [80, 50, '*', 100],
              body: [
                [
  { text: '(دولار) السعر', style: 'tableHeader', alignment: 'center' },
  { text: 'الكمية', style: 'tableHeader', alignment: 'center' },
                  { text: 'موديل', style: 'tableHeader', alignment: 'center' },
                  { text: 'الاسم', style: 'tableHeader', alignment: 'center' }
                ],
                // الصف الأول: الألواح
                [
{ text: `$${totalPanelsPrice}`, alignment: 'center' },
  { text: (results.panels || 0).toString(), alignment: 'center' },
  { text: `${(results.panelName || '650 واط ايكو وجهين').split(' ').reverse().join(' ')}`, alignment: 'right' },
    { text: 'الواح', alignment: 'right' }
                ],
                // الصف الثاني: الانفرتر
                [
{ text: `$${totalInverterPrice}`, alignment: 'center' },
 { text: '1', alignment: 'center' },
{ text: (results.inverterName || 'انفرتر 6 كيلو جروات').split(' ').reverse().join(' '), alignment: 'right' },
  { text: 'جهاز', alignment: 'right' }
                ],
                // الصف الثالث: البطارية
                [
{ text: `$${totalBatteriesPrice}`, alignment: 'center' },
{ text: '1', alignment: 'center' },
{ text: (results.batteryName || 'بطارية ليثيوم 15 كيلو MMD Pro').split(' ').reverse().join(' '), alignment: 'right' },
{ text: 'بطارية _LifePo4', alignment: 'right' }
                ]
              ]
            },
            layout: {
              fillColor: (rowIndex) => {
                return (rowIndex === 0) ? '#007a3d' : (rowIndex % 2 === 0 ? '#f5f5f5' : null);
              },
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => '#ccc',
              vLineColor: () => '#ccc'
            },
            margin: [0, 0, 0, 15]
          },

          // الإجمالي المعكوس
          {
  text: `$${totalPrice} :الإجمالي`,
            fontSize: 14,
            bold: true,
            color: '#007a3d',
            alignment: 'left', // ليبقى في جهة اليسار كما في الكود الأصلي
            margin: [0, 5, 0, 20]
          },


          // ====== التذييل ======
          { text: '', canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, color: '#007a3d' }], margin: [0, 10, 0, 10] },

{
  stack: [
    { 
      text: 'land Solar بواسطة التقرير هذا إنشاء تم', 
      fontSize: 9, 
      color: '#888', 
      alignment: 'center', 
      margin: [0, 0, 0, 5] 
    },
    { 
      text: '2026 © محفوظة الحقوق جميع', 
      fontSize: 9, 
      color: '#888', 
      alignment: 'center' 
    }
  ],
  margin: [0, 5, 0, 0]
}

        ],

        styles: {
          tableHeader: {
            bold: true,
            fontSize: 10,
            color: 'white',
            fillColor: '#007a3d',
            alignment: 'center'
          }
        }
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const stream = fs.createWriteStream(outputPath);
      pdfDoc.pipe(stream);
      pdfDoc.end();

      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

export default generateSolarPDF;