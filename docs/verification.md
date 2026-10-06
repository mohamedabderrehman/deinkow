# Current release verification

Recorded on 2026-10-06 using disposable local data. Historical deployment is a separate owner-provided fact.

## Passed locally

Fresh MariaDB schema/bootstrap and PHP syntax checks passed. HTTP checks passed client/admin login, request and message creation, foreign ticket/chat rejection, validated text attachment upload, blocked direct attachment access, authorized download and unauthorized download rejection. Browser review exposed and repaired login aliases and the demo CAPTCHA dependency.

## Checks and commands

```sh
php tools/bootstrap.php
php -S 127.0.0.1:8086 router.php
# Separate terminal:
python tools/check-demo.py
python tools/check-syntax.py
```

## CI status

The configured GitHub Actions workflows are registered, but the initial runs ended with startup_failure before any jobs or check annotations were created. Local results above are independent of CI. No passing CI badge is shown; the service supplied no further diagnostic message through the available API.

## Remaining platform and coverage limits

The public site and client portal mix standalone HTML pages and client-side routing; do not describe every route as one SPA. CAPTCHA and mail/provider configuration require fresh live credentials. Additional browser-history and administrative workflows remain to be checked.

PHP checks used PHP 8.4.26; Node builds used Node 24.19; Python checks used Python 3.12.10 where applicable. This record does not claim production hardening, paid provider verification or tests on every platform.
