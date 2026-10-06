# الإعداد

استخدم PHP مع PDO MySQL وcURL وfileinfo وMySQL. استورد `database.sql` ثم `database_updates.sql` مع فحص المخطط قبل إعادة التحديثات. اضبط متغيرات قاعدة البيانات ومفتاح JWT جديداً. يلزم Apache مع mod_rewrite للمسارات النظيفة؛ خادم PHP التطويري لا يقرأ `.htaccess`. اضبط reCAPTCHA للمصادقة الحقيقية وصلاحيات مجلد الملفات.

## التفاصيل والأوامر

Use PHP with PDO MySQL, cURL and fileinfo plus MySQL. Import `database.sql` before `database_updates.sql`, inspecting existing schema before applying updates again. Export `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` and a fresh `JWT_SECRET`. Apache with mod_rewrite supports clean URLs; the PHP development server alone does not interpret `.htaccess`. Configure reCAPTCHA for real authentication. Keep upload paths writable and protect private attachment access.

## متغيرات تقرأها الشيفرة

| Variable | Source consumer | Configuration rule |
|---|---|---|
| `CORS_ORIGIN` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |
| `DB_HOST` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |
| `DB_NAME` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |
| `DB_PASS` | `api/config.php` | Supply privately when enabling its integration; no secret default. |
| `DB_USER` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |
| `DEBUG_MODE` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |
| `JWT_SECRET` | `api/config.php` | Supply privately when enabling its integration; no secret default. |
| `LEAKED_DATA_PATH` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |
| `RECAPTCHA_SECRET_KEY` | `api/config.php` | Supply privately when enabling its integration; no secret default. |
| `RECAPTCHA_SITE_KEY` | `api/config.php` | Use the local example/source default; adapt to your disposable environment. |

لا تُحمَّل ملفات الأمثلة تلقائياً. تستخدم وحدات dotenv الملف حيث تكون مهيأة، ويستخدم PHP بيئة العملية أو الاستضافة. افصل المزودين عن العرض وأنشئ أسراراً جديدة واحفظها خارج المستودع.

## أوامر المكونات
