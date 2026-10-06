# Arabic software studio and client portal

## From the problem to the implementation

Connect a public studio website to structured client requests, project conversations and administrative follow-up.

Visitor explores studio services → client submits a request → client and administrator exchange messages/files in its workroom → notifications and status updates maintain continuity.

## Decisions and tradeoffs

Public HTML pages and the client-side account router serve different purposes. The entire website is not one uniform SPA.

History navigation now falls back to the current path when popstate has no route state; app/index paths normalize to the dashboard.

Apache resolves existing public HTML routes before the account application fallback. API and attachment authorization remain server responsibilities.

Ticket ownership must apply to messages and files as well as ticket metadata. Generated presentation counters are not operational evidence.

## What the publication preparation established

Fresh MariaDB schema/bootstrap and PHP syntax checks passed. HTTP checks passed client/admin login, request and message creation, foreign ticket/chat rejection, validated text attachment upload, blocked direct attachment access, authorized download and unauthorized download rejection. Browser review exposed and repaired login aliases and the demo CAPTCHA dependency.

## Deployment experience and evidence limits

Previously deployed and tested studio website and client portal.

The public site and client portal mix standalone HTML pages and client-side routing; do not describe every route as one SPA. CAPTCHA and mail/provider configuration require fresh live credentials. Additional browser-history and administrative workflows remain to be checked.

## Next steps

Complete the uncovered checks above, record the results, and update the demonstration. Retain the existing architecture and add reproducible synthetic cases before claiming performance improvements or another provider integration.
