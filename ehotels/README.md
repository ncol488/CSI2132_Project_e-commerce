This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Tech Stack

| Layer         | Technology                   |
| ------------- | ---------------------------- |
| Database      | PostgreSQL                   |
| Backend / API | Next.js API Routes (Node.js) |
| Frontend      | React (via Next.js)          |
| Styling       | Tailwind CSS                 |
| DB Client     | node-postgres (`pg`)         |

---

## Prerequisites

- [Node.js v18+](https://nodejs.org)
- [PostgreSQL 14+](https://www.postgresql.org)
- npm (bundled with Node.js)

---

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

---

## Database setup - Execution order

- createtables.sql
- triggers.sql
- views.sql
- indexes.sql
- populationData.sql

## Login credentials

Login: customer@customer.com
Password: test
