# تسليم التطبيق لمشترٍ جديد

هذه نسخة نظيفة: لا مفاتيح سرية، ولا إعدادات Firebase أو ImageKit، ولا مفتاح توقيع، ولا اسم تطبيق.
كل ما يخص العميل مكتوب كرموز `{{...}}` تُملأ بأمر واحد.

## 1. حسابات العميل (على بريده هو)
1. **Firebase**: مشروع جديد → فعّل Authentication (Google) و Firestore و Cloud Messaging.
   - أضف تطبيق Web وانسخ إعداداته.
   - أضف تطبيق Android بنفس `PACKAGE_ID`، ونزّل `google-services.json` وضعه في جذر المشروع.
   - من إعدادات المشروع → Service accounts: أنشئ مفتاحاً خاصاً (JSON).
2. **ImageKit**: حساب جديد → انسخ URL endpoint id والمفتاح العام والمفتاح الخاص.
3. **OxaPay** (إن أراد المحفظة): Merchant API key و Payout API key.
4. **Vercel**: استيراد المستودع → يصبح الرابط هو `DOMAIN`.
5. **GitHub**: مستودع خاص للعميل.

## 2. ملء البيانات
```bash
cp setup/client.example.json setup/client.json   # املأ كل الحقول
node setup/apply.mjs setup/client.json
bash tests/run.sh                                 # يجب أن تنجح كل الاختبارات
```
- `SLUG`: حروف إنجليزية صغيرة، ويُستخدم لرابط فتح التطبيق `slug://`.
- `SHA256`: بصمة مفتاح التوقيع، وتظهر في سجل بناء GitHub Actions.
- استبدل الأيقونات في `android-res/` و `site/play-icon-512.png` بشعار العميل.

## 3. أسرار Vercel (Environment Variables)
`FIREBASE_SERVICE_ACCOUNT` (محتوى JSON كاملاً) · `IMAGEKIT_PRIVATE_KEY` · `ADMIN_SETUP_SECRET` · `CRON_SECRET` (نص عشوائي طويل لكل منهما)
· `OXAPAY_MERCHANT_KEY` · `OXAPAY_PAYOUT_KEY` · `OXAPAY_SANDBOX=true` للتجربة ثم احذفه.

## 4. مفتاح توقيع جديد للعميل
```bash
keytool -genkey -v -keystore release.keystore -alias SLUG -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.keystore   # → سر GitHub باسم KEYSTORE_BASE64
```
وأضف `KEYSTORE_PASSWORD` في أسرار GitHub. سلّم الملف وكلمة السر للعميل، فبدونهما لا يستطيع تحديث التطبيق على Google Play.

## 5. التشغيل
1. انشر قواعد Firestore من `firestore.rules`.
2. اجعل حساب العميل مديراً عبر `/api/set-admin` بالسر `ADMIN_SETUP_SECRET`.
3. من لوحة التحكم اضغط **إعداد الفهارس**.
4. اضبط سعر الصرف ورقم واتساب الدعم.
5. شغّل GitHub Actions → APK للتجربة و AAB لـ Google Play.
6. جرّب إيداعاً وسحباً صغيرين، ثم احذف `OXAPAY_SANDBOX`.

راجع `README.md` لشرح كل ميزة بالتفصيل.
