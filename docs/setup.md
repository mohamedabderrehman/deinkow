# Clean setup

Create an empty MySQL/MariaDB database and export the variables in .env.example into the PHP process environment; PHP does not automatically load that file. Set DB_HOST/DB_PORT/DB_USER/DB_PASS/DB_NAME, fresh JWT_SECRET, DEMO_PASSWORD and DEMO_MODE=1. The CLI bootstrap applies database.sql, database_support_tickets.sql and database_updates.sql in that order and creates admin/client/other. It is for a fresh database, not a migration tool for production. DEMO_MODE bypasses CAPTCHA only on the server; live mode requires fresh RECAPTCHA_SITE_KEY and RECAPTCHA_SECRET_KEY.

## Commands

```sh
php tools/bootstrap.php
php -S 127.0.0.1:8086 router.php
# Separate terminal:
python tools/check-demo.py
python tools/check-syntax.py
```

## Complete configuration inventory

Use PHP with PDO MySQL, cURL and fileinfo plus MySQL. Import `database.sql` before `database_updates.sql`, inspecting existing schema before applying updates again. Export `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` and a fresh `JWT_SECRET`. Apache with mod_rewrite supports clean URLs; the PHP development server alone does not interpret `.htaccess`. Configure reCAPTCHA for real authentication. Keep upload paths writable and protect private attachment access.

## Environment variables read by source

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

Environment examples do not load themselves. Node dotenv modules read local `.env` where configured; PHP uses its process/hosting environment. Keep provider integrations disconnected for demos. Generate a new secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` or equivalent, then store it privately.

## Declared component commands



## Source boundaries

| Component | Responsibility |
|---|---|
| `js/` | Router, page controllers and UI modules |
| `css/` | Modular RTL presentation |
| `api/` | PHP authentication, tickets, chat, files and administration |
| `database.sql` | Base schema |
| `database_updates.sql` | Incremental schema changes |


Variables in the inventory are not all mandatory: the preceding prerequisites identify the required core values. Provider variables are required only for their enabled live integration. Tests may use DEMO_API_URL to override the local target. Never point bootstrap/reset/check scripts at a production database.
