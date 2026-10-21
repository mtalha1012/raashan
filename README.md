# Raashan

A MERN grocery delivery app built around how Pakistani families actually shop: someone posts *"doodh 2, anday 12 aur double roti"* in the family WhatsApp group, and someone else retypes it at the shop. Raashan reads those messages, matches each line to a product, and keeps **one shared list for the whole household**. When the list is ready, it goes into a cart and becomes a cash-on-delivery order in a delivery slot.

Built with **MongoDB, Express 5, React 19 + Redux Toolkit, Node.js**.

**Live:** _add your Render URL here_ · **Repo:** https://github.com/mtalha1012/raashan

## Features

- **Auth**: register, log in, log out, forgot / reset password by email, change password. JWT in an httpOnly cookie (or `Authorization: Bearer`), bcrypt-hashed passwords, `user` / `admin` roles. Protected and admin-only routes on both the API and the React side.
- **Households**: create one, share a six-character invite code, join with it. Nicknames ("Ammi", "Abbu"), owner can rename, remove members, or issue a new code.
- **Shared family list**: everyone in the household writes on the same list. Add a line by typing it ("dahi 1 kg"), from a product page, or by **pasting WhatsApp messages**.
- **WhatsApp list reader** (`backend/utils/listParser.js`): strips chat timestamps, keeps who sent each line, splits on commas / "aur" / "and", understands Roman Urdu names and quantities ("anday 12" → 1 × Eggs 12 pcs, "atta 20 kg" → 2 × 10 kg bag, "aadha kilo dahi"), and forgives one typo. Every result is shown for the user to confirm first. Nothing is guessed silently: unmatched lines stay on the list to be linked by hand.
- **List → cart**: one tap moves every linked, open line into your cart (as much as stock allows) and ticks it off. Anything skipped is listed with the reason.
- **Shop**: categories, search by name *or* alias ("doodh" finds Milk), pagination.
- **Checkout**: saved addresses, delivery day (today + 6 days, Pakistan time) and slot with a daily capacity. Today's slots close an hour before they start.
- **Orders**: stock reserved atomically, prices always from the database, delivery fee under Rs 2,500. Status flow `Placed → Packed → Out for Delivery → Delivered`. Customers cancel while still `Placed`. The whole household can see each other's orders.
- **Admin**: manage orders, products (with aliases), categories, delivery slots and users.

## CRUD resources

| Resource | Create | Read | Update | Delete | Who |
| --- | --- | --- | --- | --- | --- |
| Products | ✔ | ✔ | ✔ | ✔ | Admin (read is public) |
| Categories | ✔ | ✔ | ✔ | ✔ | Admin (read is public) |
| Delivery slots | ✔ | ✔ | ✔ | ✔ | Admin (availability is public) |
| Households | ✔ | ✔ | ✔ | ✔ | Members / owner |
| Family list items | ✔ | ✔ | ✔ | ✔ | Household members |
| Addresses | ✔ | ✔ | ✔ | ✔ | Each user, own addresses only |
| Cart | ✔ | ✔ | ✔ | ✔ | Each user |
| Orders | ✔ | ✔ | ✔ (status / cancel) | ✔ | Customer + admin |
| Users | ✔ (register) | ✔ | ✔ | ✔ | Self + admin |

## Project structure

```
raashan/
├── backend/                 # Express API (MVC)
│   ├── app.js               # Middleware, routes, error handler; serves frontend/dist in production
│   ├── server.js            # Loads env, connects MongoDB, starts the server
│   ├── config/              # config.env.example, database.js
│   ├── models/              # User, Product, Category, Household, ListItem, Address, DeliverySlot, Cart, Order
│   ├── controllers/         # Request handlers
│   ├── routes/              # URL → controller mapping
│   ├── middleware/          # auth (login + roles), household, asyncError, error
│   ├── utils/               # listParser, deliveryDates, pricing, apifeatures, jwtToken, sendEmail
│   ├── scripts/             # seed.js + seedData.js, makeAdmin.js
│   └── tests/               # listParser.test.js (node:test)
├── frontend/                # React + Vite + Redux Toolkit + Tailwind
│   └── src/
│       ├── app/store.js
│       ├── lib/             # api.js (fetch + apiThunk), format.js
│       ├── components/      # Layout, Navbar, ProtectedRoute, shared UI
│       └── features/        # auth, shop, cart, household, addresses, orders, admin, ui
│                            # each: <name>Slice.js + its pages / components
└── render.yaml              # One-click Render deploy
```

## Run it locally

**Needs:** Node.js 20+ and MongoDB (local, or a MongoDB Atlas connection string).

```bash
git clone <your-repo-url>
cd raashan
npm install
npm install --prefix frontend
cp backend/config/config.env.example backend/config/config.env
```

Fill in `backend/config/config.env` (at least `DB_URI` and `JWT_SECRET`), then load the starter catalogue and demo family:

```bash
npm run seed
```

Start the API (port 4000) and the React dev server (port 5173, proxies `/api` to the API) in two terminals:

```bash
npm run dev
```

```bash
npm run client
```

Open http://localhost:5173.

### Demo accounts (created by `npm run seed`)

| Email | Role | Notes |
| --- | --- | --- |
| `admin@raashan.test` | admin | Sees the Admin tab |
| `talha@raashan.test` | user | Owner of "Talha's Family", has a saved address |
| `ammi@raashan.test` | user | Member of the same household |

All three use the password `raashan-demo-2026`. The demo household's invite code is `KHAN26`.

> `npm run seed` wipes the Raashan collections first. Use `npm run seed -- --keep-users` to keep existing accounts.

To promote any account to admin: `npm run make-admin -- someone@example.com`

### Tests

```bash
npm test
```

Runs the list-reader tests against the seed catalogue (no database needed).

## Deploy (Render + MongoDB Atlas)

One Render web service runs the API and serves the built React app, so the site and API share a URL: no CORS setup, and the auth cookie just works.

1. **MongoDB Atlas**: create a free cluster, a database user, and allow access from anywhere (`0.0.0.0/0`). Copy the connection string and add a database name, e.g. `.../raashan?retryWrites=true&w=majority`.
2. **Seed it** from your machine: put that string in `DB_URI` in `backend/config/config.env` and run `npm run seed`.
3. **Push** this repo to GitHub.
4. **Render**: New → Blueprint → pick the repo. It reads `render.yaml`. When asked, set `DB_URI` (the Atlas string) and `CLIENT_URL` (your Render URL, e.g. `https://raashan.onrender.com`; you can fill it in after the first deploy). `JWT_SECRET` is generated for you.
5. Optional: add the `SMTP_*` variables from `config.env.example` so forgot-password emails send.

Build command: `npm install && npm run build` (installs and builds `frontend/`). Start command: `npm start`. Health check: `/api/v1/health`.

Free Render services sleep after 15 minutes idle, so the first visit after a break takes ~30 seconds.

## API reference

All routes are prefixed with `/api/v1`. 🔒 = login required, 🏠 = must be in a household, 👑 = admin only. Errors always look like `{ "success": false, "message": "..." }`.

### Auth & users

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| POST | `/register` | Public | `{ name, email, password, phone? }` |
| POST | `/login` | Public | `{ email, password }` |
| GET | `/logout` | Public | Clears the cookie |
| POST | `/password/forgot` | Public | `{ email }`, emails a link to `CLIENT_URL/password/reset/:token` |
| PUT | `/password/reset/:token` | Public | `{ password, confirmPassword }` |
| GET | `/me` | 🔒 | Current user |
| PUT | `/me/update` | 🔒 | `{ name?, email?, phone? }` |
| PUT | `/password/update` | 🔒 | `{ oldPassword, newPassword, confirmPassword }` |
| GET / PUT / DELETE | `/admin/users`, `/admin/user/:id` | 👑 | List, change role, delete (also leaves their household) |

### Catalogue

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| GET | `/products` | Public | `keyword` (name or alias), `category` (id), `price[gte]`, `price[lte]`, `page` (12 per page) |
| GET | `/products/:id` | Public | |
| POST | `/products/new` | 👑 | `{ name, category, price, unit, stock, aliases?, image?, description? }`. `aliases` can be an array or `"doodh, dudh"` |
| PUT / DELETE | `/products/:id` | 👑 | Delete also removes it from carts and unlinks it from lists |
| GET | `/admin/products` | 👑 | All products, unpaginated |
| GET | `/categories`, `/categories/:id` | Public | Includes `productCount` |
| POST / PUT / DELETE | `/admin/categories[/:id]` | 👑 | `{ name, icon, description, sortOrder }`. Delete is blocked while products use it |

### Households & the family list

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| GET | `/household` | 🔒 | Your household, or `null` |
| POST | `/household` | 🔒 | `{ name, nickname? }`, you become the owner |
| POST | `/household/join` | 🔒 | `{ inviteCode, nickname? }` |
| PUT | `/household` | 🏠 owner | `{ name }` |
| DELETE | `/household` | 🏠 owner | Deletes it and its list for everyone |
| POST | `/household/leave` | 🏠 | Ownership passes on; the last one out deletes it |
| PUT | `/household/nickname` | 🏠 | `{ nickname }` |
| PUT | `/household/invite-code` | 🏠 owner | New code, the old one stops working |
| DELETE | `/household/members/:userId` | 🏠 owner | |
| GET | `/household/orders` | 🏠 | Orders placed by anyone in the household |
| GET | `/household/list` | 🏠 | Open items first |
| POST | `/household/list` | 🏠 | `{ productId }` or `{ text }` (text is matched automatically), `quantity?` |
| POST | `/household/list/parse` | 🏠 | `{ message }`, returns a preview, saves nothing |
| POST | `/household/list/bulk` | 🏠 | `{ items: [{ text, productId?, quantity, requestedBy? }] }`, up to 50 |
| PUT | `/household/list/:id` | 🏠 | `{ quantity?, text?, done?, productId? }` |
| DELETE | `/household/list/:id` | 🏠 | |
| DELETE | `/household/list/done` | 🏠 | Clears ticked items |
| POST | `/household/list/to-cart` | 🏠 | Moves open, linked items into your cart. Returns `{ moved, skipped }` |

### Addresses, slots, cart, orders

| Method | Route | Access | Body / notes |
| --- | --- | --- | --- |
| GET / POST | `/addresses` | 🔒 | `{ label, line1, area, city, phone, isDefault? }`. The first address becomes the default |
| PUT / DELETE | `/addresses/:id` | 🔒 | Own addresses only |
| GET | `/slots?date=YYYY-MM-DD` | Public | Active slots with `remaining`, `available` and `reason`, plus the bookable `dates` |
| GET / POST | `/admin/slots` | 👑 | `{ label, startTime: "09:00", endTime: "12:00", capacity, isActive }` |
| PUT / DELETE | `/admin/slots/:id` | 👑 | Delete is blocked while upcoming orders use the slot |
| GET / POST / DELETE | `/cart` | 🔒 | Get, add `{ productId, quantity? }`, empty. Includes `deliveryFee` |
| PUT / DELETE | `/cart/:productId` | 🔒 | Set quantity, remove |
| POST | `/order/new` | 🔒 | `{ addressId, slotId, deliveryDate, orderItems? }`. Uses the cart when `orderItems` is omitted |
| GET | `/orders/me` | 🔒 | |
| GET | `/order/:id` | 🔒 | Owner, their household, or admin |
| PUT | `/order/:id/cancel` | 🔒 | Owner, while `Placed` |
| GET | `/admin/orders` | 👑 | All orders + `totalAmount` (excluding cancelled) |
| PUT | `/admin/order/:id` | 👑 | `{ status }`, only the next step in the flow (or `Cancelled`) |
| DELETE | `/admin/order/:id` | 👑 | Returns stock if the order was still active |

---

Started from my ecommerce-backend project (auth, products, cart and orders), extended into Raashan for the DevWeekends MERN project.
