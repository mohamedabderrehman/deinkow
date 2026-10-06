# Deployment and troubleshooting

## Historical status

Previously deployed and tested studio website and client portal.

موقع استوديو وبوابة عملاء نُشرا واختُبرا سابقاً.

## Local release environment

Use fresh configuration, a disposable database/corpus and independently installed dependencies. This release never needs retired production services. Keep credentials, uploaded files, sessions, caches and signing material outside the public source. Credential removal does not revoke a provider key.

## Troubleshooting

### Clean URL returns 404

Enable Apache mod_rewrite; PHP built-in server does not apply .htaccess.

### Unknown SQL column

Apply base schema before incremental updates; review an existing database before reapplying.

### Authentication fails

Confirm JWT_SECRET and reCAPTCHA configuration, not an original deployment secret.

### Wrong account route

Inspect js/router.js normalization and browser history against the actual path.

## Current limits

Full client workflow requires a fresh MySQL schema and configured authentication. Demo counters must be labelled. Private uploads and original SFTP configuration are excluded.

تحتاج إجراءات العميل الكاملة إلى MySQL ومصادقة مهيأة. يجب وسم العدادات التجريبية. استُبعدت المرفقات الخاصة وإعدادات SFTP.
