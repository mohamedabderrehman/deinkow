# API and execution paths

This index is extracted from the current source. Router-local paths require their mount prefix from the server entry point. PHP endpoint paths map directly to files unless Apache rewrites them. Controllers and auth middleware are authoritative for request bodies and permissions.

See the source entry points below; this project does not declare Express/Flask router paths.

## Source entry points

- [js/router.js](../js/router.js)
- [api/config.php](../api/config.php)
- [database.sql](../database.sql)
- [database_updates.sql](../database_updates.sql)

## الاستخدام

المسارات المذكورة محلية للموجه وتحتاج بادئة الربط في الخادم. ملفات PHP هي مرجع المسارات ما لم تُعَد كتابتها. استخدم بيانات اصطناعية وفحوص الصلاحيات الموجودة في الشيفرة.


## Representative usage

Ticket creation requires a signed-in client. The server derives ownership from the JWT; downloads require the authorized owner or administrator. Do not send JWTs in public download URLs.

```sh
curl -X POST http://localhost:8086/api/auth/login.php -H 'Content-Type: application/json' -d '{"emailOrUsername":"client","password":"YOUR_DEMO_PASSWORD"}'
curl -X POST http://localhost:8086/api/support/tickets.php -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_DEMO_TOKEN' -d '{"subject":"Synthetic request","message":"Generated client brief","priority":"medium"}'
curl 'http://localhost:8086/api/chat/index.php?ticket_id=YOUR_TICKET_ID' -H 'Authorization: Bearer YOUR_DEMO_TOKEN'
curl 'http://localhost:8086/api/files/download.php?id=YOUR_FILE_ID' -H 'Authorization: Bearer YOUR_DEMO_TOKEN' -o synthetic-download.txt
```
