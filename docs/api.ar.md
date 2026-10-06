# الواجهات ومسارات التنفيذ

يستكشف الزائر خدمات الاستوديو ← يرسل العميل طلباً ← يتبادل العميل والإدارة الرسائل والملفات في غرفة العمل ← تحافظ الإشعارات والحالات على متابعة العمل.

تحتاج المسارات المحلية للموجه إلى بادئة الخادم. تستخدم مسارات PHP الملفات الفعلية ما لم توجد إعادة كتابة. المتحكمات والوسطاء في الشيفرة مرجع الحقول والصلاحيات. فحوص tools/check-demo تمثل طلبات حقيقية ببيانات اصطناعية وليست مزوداً وهمياً.

## مراجع التنفيذ

- [js/router.js](../js/router.js)
- [api/config.php](../api/config.php)
- [database.sql](../database.sql)
- [database_updates.sql](../database_updates.sql)

## حدود التكامل

يجمع الموقع صفحات HTML مستقلة وتوجيهاً في العميل؛ ليست كل المسارات تطبيقاً أحادي الصفحة. يحتاج CAPTCHA والبريد والمزودون بيانات جديدة. يلزم فحص إضافي لتاريخ المتصفح ومسارات الإدارة.


## جرد المسارات



## مثال الاستخدام

يتطلب إنشاء التذكرة عميلاً مصادقاً. يستمد الخادم المالك من JWT وتتطلب التنزيلات المالك أو المدير المصرح. لا ترسل JWT في روابط تنزيل عامة.

```sh
curl -X POST http://localhost:8086/api/auth/login.php -H 'Content-Type: application/json' -d '{"emailOrUsername":"client","password":"YOUR_DEMO_PASSWORD"}'
curl -X POST http://localhost:8086/api/support/tickets.php -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_DEMO_TOKEN' -d '{"subject":"Synthetic request","message":"Generated client brief","priority":"medium"}'
curl 'http://localhost:8086/api/chat/index.php?ticket_id=YOUR_TICKET_ID' -H 'Authorization: Bearer YOUR_DEMO_TOKEN'
curl 'http://localhost:8086/api/files/download.php?id=YOUR_FILE_ID' -H 'Authorization: Bearer YOUR_DEMO_TOKEN' -o synthetic-download.txt
```
