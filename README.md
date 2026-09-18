# Singh Readymade Vastralaya — Full-Stack Demo

A dynamic clothing e-commerce starter built with Next.js + Prisma.

## Included
- Dynamic PostgreSQL-ready/SQLite development database model
- 24 seeded demo products with brand, price, MRP, discount, colors, sizes, stock and images
- Men, Women, Kids, Unisex, Sarees, Jeans, T-Shirts, Winter Wear, Innerwear and more
- Search + category/gender filtering
- Product detail pages
- Dynamic cart using browser storage
- Admin catalogue page for adding/deleting products
- API routes connected to Prisma
- Responsive design
- Cursor-following glow / pointer movement effect
- Store contact: 7050189007
- Store email: mohitkumarsingh7050@gnmail.com

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Run:
   npm install
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
4. Open http://localhost:3000

## Production
Change DATABASE_URL to a PostgreSQL connection string (Neon/Supabase/etc.), run `npx prisma migrate deploy`, then deploy to Vercel.

## Important next upgrades
- Real authentication for customers/admin
- Razorpay payment gateway
- Cloudinary/Vercel Blob for product uploads
- Orders table + order API
- Address/checkout flow
- Coupon engine
- Admin edit/update product
- Secure admin authorization
- GST/shipping configuration
- Real product images and brand data

The demo intentionally uses placeholder images and sample catalogue values so they can be replaced later.
