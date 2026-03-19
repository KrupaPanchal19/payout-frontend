# CORD4 - Frontend (Next.js)

This is a Next.js **App Router + TypeScript** UI for:

- Vendor list + add vendor
- Payout Requests workflow (Draft → Submitted → Approved/Rejected)
- Audit trail per payout

Role-based access and status transitions are enforced on the **server** via Next.js route handlers under `src/app/api/*`.

## Prerequisites

- Install Node.js (LTS) so `node`, `npm`, `npx` are available in PowerShell.

## Setup

1. Create an env file:

```bash
copy .env.example .env.local
```

2. Install dependencies:

```bash
npm install
```

3. Run dev server:

```bash
npm run dev
```

Then open `http://localhost:3000`.

## Using the app

- Use the top-right menu to login as **OPS** or **FINANCE**
- **OPS**: can create payouts (Draft) and submit (Draft → Submitted)
- **FINANCE**: can approve/reject (Submitted → Approved/Rejected, reject requires reason)

"# payout-frontend" 
