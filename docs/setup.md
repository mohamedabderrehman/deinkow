# Setup and configuration

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
