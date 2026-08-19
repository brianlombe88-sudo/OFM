# Farm Market — Backend

Run locally:

```bash
cd BACKEND
npm install
npm run dev
```

Ensure `.env` contains `MONGODB_URI` and `JWT_SECRET` (already present).

Health: `GET /`
Register: `POST /api/auth/register`
Login: `POST /api/auth/login`
Products: `GET /api/products`, `POST /api/products` (auth)
Orders: `POST /api/orders` (auth)
Payment webhook: `POST /api/payments/webhook` (stub)
Admin: `GET /api/admin/users` (admin)
