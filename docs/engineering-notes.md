## Carrying a studio enquiry into a client workroom

Deinkow joins a public Arabic studio website to a working PHP client portal. The engineering story continues after the marketing page: a client submits a request, opens the associated workroom, exchanges messages and files, and receives administrative follow-up. The synthetic walkthrough follows that handoff so the website is evaluated as a business workflow.

Its frontend combines standalone pages with a Vanilla JavaScript router and modular styling. Calling every route a complete SPA would hide the actual structure. Direct navigation, login aliases and refresh behavior need to match the page-loading paths that exist. The release fixes the demonstrated login route problems and provides a fresh schema bootstrap with an explicit SQL ordering.

## Making attachments part of the permission model

A file upload is not private merely because its filename is difficult to guess. The release moves attachment access behind authenticated ownership checks, blocks direct public access and validates content. The acceptance flow checks a client's attachment, an administrator's access and rejection for a different client.

Arabic typography, RTL layout and theme behavior retain the project's identity. Previously deployed workflows are documented separately from current local evidence. The next review should extend browser-history and administration scenarios across the remaining pages, with public marketing pages crawlable and account/workroom content kept private.
