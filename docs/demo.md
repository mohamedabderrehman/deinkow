# Synthetic demonstration

Visitor explores studio services → client submits a request → client and administrator exchange messages/files in its workroom → notifications and status updates maintain continuity.

## Walkthrough

1. Create a synthetic client and request.
2. Exchange a message and harmless attachment from the client workroom.
3. Open the request as administrator and change its status.
4. Refresh direct public/account routes and verify browser back/forward and foreign-ticket rejection.

## Acceptance checklist

- [ ] PHP syntax
- [ ] Direct route, refresh and browser history behavior
- [ ] Client ticket and attachment isolation
- [ ] Administration permissions

## Evidence discipline

Screenshots must come from the running application with synthetic records. Record the component, viewport and configuration. A storyboard is not a recorded walkthrough. Benchmark only generated data and include hardware, input size, configuration, elapsed time and cache conditions.

Full client workflow requires a fresh MySQL schema and configured authentication. Demo counters must be labelled. Private uploads and original SFTP configuration are excluded.
