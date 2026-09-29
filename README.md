# E-Commerce Backend

A production-style REST API for an e-commerce store, built with **Node.js, Express 5 and MongoDB (Mongoose)**.

Features:

- **Auth** – register / login / logout with JWT (httpOnly cookie *or* `Authorization: Bearer` header), bcrypt-hashed passwords, forgot / reset password by email, role-based access (`user`, `admin`)
- **Products** – full CRUD (admin), public listing with search, filters and pagination
- **Cart** – per-user cart with stock checks and live totals
- **Orders** – place orders from the cart or an explicit item list, server-side pricing, atomic stock reservation, cancel / status workflow, admin management
- Centralised error handling (validation, bad ObjectIds, duplicate keys, JWT errors, unknown routes)

## Project structure (MVC)

```
backend/
├── app.js                 # Express app: middleware, routes, error handler
├── server.js              # Loads env, connects DB, starts server
├── config/
│   ├── config.env.example # Template for environment variables
│   └── database.js        # MongoDB connection
├── models/                # Mongoose schemas (M)
│   ├── userModel.js
│   ├── productModel.js
│   ├── cartModel.js
│   └── orderModel.js
├── controllers/           # Request handlers / business logic (C)
│   ├── userController.js
│   ├── productController.js
│   ├── cartController.js
│   └── orderController.js
├── routes/                # URL → controller mapping
│   ├── userRoute.js
│   ├── productRoute.js
│   ├── cartRoute.js
│   └── orderRoute.js
├── middleware/
│   ├── auth.js            # isAuthenticatedUser, authorizedRoles
│   ├── asyncError.js      # Wraps async handlers
│   └── error.js           # Global error handler
├── utils/                 # ErrorHandler, ApiFeatures, jwtToken, sendEmail
└── scripts/
    └── makeAdmin.js       # Promote a user to admin
```

The "view" layer is the JSON the API returns.

## Setup

**Prerequisites:** Node.js 20+ and MongoDB (local or Atlas).

```bash
git clone <your-repo-url>
cd ecommerce-backend
npm install
```

Create the env file from the template and fill in your values:

```bash
cp backend/config/config.env.example backend/config/config.env
```

| Variable | Description |
| --- | --- |
| `PORT` | Port the server listens on (e.g. `4000`) |
| `DB_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `JWT_EXPIRE` | Token lifetime, e.g. `5d` |
| `COOKIE_EXPIRE` | Cookie lifetime in days, e.g. `7` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD`, `SMTP_FROM_NAME` | Mail settings for the forgot-password email |

`config.env` is git-ignored – never commit real secrets. Variables already set in the environment (e.g. on a hosting provider) take precedence over the file.

Run the server:

```bash
npm run dev   # with nodemon
npm start     # plain node
```

The API is served at `http://localhost:<PORT>/api/v1`.

### Creating an admin

New accounts are always `user`. Register normally, then promote the account:

```bash
npm run make-admin -- admin@example.com
```

After that, the admin can change other users' roles through `PUT /api/v1/admin/user/:id`.

## Authentication

`POST /login` and `POST /register` return a JWT and also set it as an httpOnly `token` cookie. Protected routes accept either:

- the `token` cookie (browsers / Postman keep it automatically), or
- the header `Authorization: Bearer <token>`

Responses: `401` when not logged in or the token is invalid/expired, `403` when the role isn't allowed.

## API routes

All routes are prefixed with `/api/v1`. 🔒 = login required, 👑 = admin only.

### Users & auth

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| POST | `/register` | Public | `{ name, email, password }` |
| POST | `/login` | Public | `{ email, password }` |
| GET | `/logout` | Public | Clears the cookie |
| POST | `/password/forgot` | Public | `{ email }` – emails a reset link |
| PUT | `/password/reset/:token` | Public | `{ password, confirmPassword }` |
| GET | `/me` | 🔒 | Current user's profile |
| PUT | `/me/update` | 🔒 | `{ name?, email? }` |
| PUT | `/password/update` | 🔒 | `{ oldPassword, newPassword, confirmPassword }` |
| GET | `/admin/users` | 👑 | List all users |
| GET | `/admin/user/:id` | 👑 | Get one user |
| PUT | `/admin/user/:id` | 👑 | `{ role: "user" \| "admin" }` |
| DELETE | `/admin/user/:id` | 👑 | Delete a user |

### Products

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| GET | `/products` | Public | Query: `keyword`, `category`, `price[gte]`, `price[lte]`, `rating[gte]`, `page` (5 per page) |
| GET | `/products/:id` | Public | Product details |
| POST | `/products/new` | 👑 | `{ name, description, price, category, stock, images: [{ publicId, url }] }` |
| PUT | `/products/:id` | 👑 | Any product fields to update |
| DELETE | `/products/:id` | 👑 | Delete product |

Example: `GET /api/v1/products?keyword=phone&category=tech&price[gte]=100&price[lte]=1000&page=2`

### Cart

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| GET | `/cart` | 🔒 | Cart with populated products, `totalItems`, `totalPrice` |
| POST | `/cart` | 🔒 | `{ productId, quantity? }` – adds, or increments if already in cart |
| PUT | `/cart/:productId` | 🔒 | `{ quantity }` – set quantity |
| DELETE | `/cart/:productId` | 🔒 | Remove one product |
| DELETE | `/cart` | 🔒 | Empty the cart |

Quantities are checked against product stock.

### Orders

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| POST | `/order/new` | 🔒 | `{ shippingInfo, orderItems?, paymentInfo? }` (see below) |
| GET | `/orders/me` | 🔒 | Current user's orders |
| GET | `/order/:id` | 🔒 | Order owner or admin only |
| PUT | `/order/:id/cancel` | 🔒 | Owner can cancel while `Processing` |
| GET | `/admin/orders` | 👑 | All orders + `totalAmount` (excluding cancelled) |
| PUT | `/admin/order/:id` | 👑 | `{ status }` – see status flow |
| DELETE | `/admin/order/:id` | 👑 | Delete order |

Example `POST /order/new` body:

```json
{
  "shippingInfo": {
    "address": "123 Main St", "city": "Lahore", "state": "Punjab",
    "country": "Pakistan", "pinCode": "54000", "phoneNo": "03001234567"
  },
  "orderItems": [{ "product": "<productId>", "quantity": 2 }],
  "paymentInfo": { "id": "pi_123", "status": "succeeded" }
}
```

- If `orderItems` is omitted, the order is created from the user's cart and the cart is emptied.
- Name and price come from the database, so the client can't set its own prices. `itemsPrice + 18% tax + shipping` (200, or free at 1000 or more) = `totalPrice`.
- Stock is reserved atomically when the order is placed and returned when an order is cancelled (or deleted while still active).

**Status flow:** `Processing → Shipped → Delivered`. `Processing` and `Shipped` orders can also move to `Cancelled`. `Delivered` sets `deliveredAt`.

## Error format

Every error returns a consistent shape:

```json
{ "success": false, "message": "Product not found" }
```
