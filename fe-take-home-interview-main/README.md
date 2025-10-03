# Take-Home: Donation Dashboard

## Overview

Build a small donation dashboard UI from a Figma mock. The dashboard should show:

- Goal amount
- Current total
- Progress bar toward the goal
- Time remaining until the event ends (live countdown)

A websocket server (provided) pushes **random donation events ~1/sec**. Your UI should subscribe, aggregate the total, and update the dashboard in real time.

You’ll also receive an HTTP endpoint with **campaign metadata**:

- `goalAmount` (in cents)
- `startingTotal` (in cents)
- `endAt` (ISO timestamp)

> We will evaluate your solution on **types** and **tests**.

## What We Provide

- A local Node.js server that:

  - Serves `GET /campaign` with `goalAmount`, `startingTotal`, `endAt`
  - Hosts a websocket at `ws://localhost:4000` that pushes random donations

- The Figma link (TODO: add Figma link)

## Requirements

### Functional

1. **Fetch campaign metadata**:
   - Goal (formatted currency)
   - Current total (starting total + live donations)
   - Progress bar (% toward goal; cap at 100%)
   - Time remaining (HH:MM:SS style, ticking every second)
2. **Connect to the websocket** and handle donation events:
   - Update state on each donation message
3. **Accessibility**
   - Should be screen reader friendly

### Technical

- **React** is required. Any modern UI stack is fine, as long as it uses React.
- **TypeScript** is required.
  - We care about accurately representing the domain so that we can leverage the type checker as our domains evolve. Please use types thoughtfully to make invalid states unrepresentable.
- **Testing**
  - We care about confidence more than any particular testing style or framework. Choose the smallest set of tests that gives high confidence the user flows work. That can be user-flow/e2e tests (e.g., Playwright), integration tests, component tests, or small unit tests where they earn their keep. We don’t expect exhaustive unit testing.

## What to Submit

- A GitHub repo with a README

