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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Package tracking & labels (Canada Post)

Orders can have a tracking number (e.g. Canada Post PIN). Admins can either **create a Canada Post label** from the order page (one click: label + tracking + order marked shipped) or add a tracking number manually.

### Environment variables

**Required for tracking and for creating labels:**

- `CANADA_POST_API_USER` – API username (often your customer number)
- `CANADA_POST_API_PASSWORD` – API password (contract password)
- `CANADA_POST_CUSTOMER_NUMBER` – Customer number used in the create-shipment URL (can be the same as `CANADA_POST_API_USER`)

**Required only for creating labels** (sender address on the label):

- `CANADA_POST_SENDER_COMPANY` – Company name
- `CANADA_POST_SENDER_ADDRESS` – Street address
- `CANADA_POST_SENDER_CITY` – City
- `CANADA_POST_SENDER_PROVINCE` – Province code (e.g. BC, ON)
- `CANADA_POST_SENDER_POSTAL_CODE` – Postal code (e.g. V8W 1A1)
- `CANADA_POST_SENDER_PHONE` – Phone number
- `CANADA_POST_SENDER_NAME` – Optional; defaults to company name

Without API credentials, you can still save a tracking number manually; status will show as "Tracking number added (manual)". Production uses `https://soa-gw.canadapost.ca`; development uses the sandbox `https://ct.soa-gw.canadapost.ca`.
