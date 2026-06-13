# XENO

XENO is a customer engagement and marketing campaign platform. It lets you manage customers and orders, define audience segments, run multi-channel campaigns (email, SMS, push, WhatsApp), and track delivery outcomes through communication logs.

The project is in early development: the backend server, MongoDB data models, and Joi validation schemas are in place. REST API routes, controllers, and a frontend are planned next.

## Features

- **Customer management** — Store customer profiles with contact info, spend history, and last order date
- **Order tracking** — Record orders with line items, status, shipping, payment, and transaction details
- **Audience segmentation** — Define reusable segments using flexible criteria rules
- **Campaign orchestration** — Create, schedule, and manage campaigns across multiple channels
- **Communication logging** — Track per-customer delivery status (sent, delivered, opened, failed)
- **Database seeding** — Populate sample customer data for local development and testing

## Tech Stack

| Layer        | Technology                          |
| ------------ | ----------------------------------- |
| Runtime      | Node.js                             |
| Framework    | Express 5                           |
| Database     | MongoDB (via Mongoose 9)            |
| Validation   | Joi 18                              |
| Middleware   | CORS, Morgan (HTTP logging), dotenv |
| Dev tooling  | @faker-js/faker (seed data)         |

## Project Structure

```
XENO/
├── backend/
│   ├── index.js                 # Express app entry point
│   ├── seed.js                  # Seed script (100 sample customers)
│   ├── example.env.js           # Environment variable loader
│   ├── package.json
│   └── src/
│       ├── database/
│       │   └── db.js            # MongoDB connection
│       ├── models/
│       │   ├── Customer.model.js
│       │   ├── Order.model.js
│       │   ├── Segment.model.js
│       │   ├── Campaign.model.js
│       │   └── Communication_Log.model.js
│       └── validation/
│           ├── Customer.validation.js
│           ├── Order.validation.js
│           ├── Segment.validation.js
│           ├── Campaign.validation.js
│           └── Communication_Log.validation.js
└── README.md
```

## Data Models

All models use Mongoose schemas with timestamps (`createdAt`, `updatedAt`), indexes for common queries, and custom `toJSON` transforms.

### Customer

Stores customer identity and purchase summary.

| Field         | Type   | Description                          |
| ------------- | ------ | ------------------------------------ |
| name          | String | Customer full name (2–100 chars)     |
| email         | String | Unique, validated email address      |
| phone         | String | Optional phone number                |
| city          | String | Customer city                        |
| totalSpent    | Number | Lifetime spend (default: 0)          |
| lastOrderDate | Date   | Date of most recent order            |

### Order

Linked to a customer via `customerId`.

| Field           | Type     | Description                                              |
| --------------- | -------- | -------------------------------------------------------- |
| customerId      | ObjectId | Reference to Customer                                    |
| amount          | Number   | Total order amount                                       |
| items           | Array    | Line items (productId, quantity, price, name)            |
| status          | String   | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `returned` |
| orderDate       | Date     | When the order was placed (immutable)                    |
| notes           | String   | Optional order notes (max 500 chars)                     |
| shippingAddress | Object   | Street, city, state, postal code, country                |
| paymentMethod   | String   | `card`, `cash`, `upi`, `wallet`, `other`                 |
| transactionId   | String   | Optional payment transaction reference                   |

### Segment

Defines a target audience for campaigns.

| Field       | Type     | Description                                      |
| ----------- | -------- | ------------------------------------------------ |
| segmentName | String   | Unique segment name                              |
| description | String   | Human-readable description                       |
| criteria    | Mixed    | Flexible rules (e.g. `{ minTotalSpent: 1000 }`)  |
| isActive    | Boolean  | Whether the segment is active                    |
| createdBy   | ObjectId | Optional reference to User                       |

### Campaign

A marketing message sent to a segment over a chosen channel.

| Field       | Type     | Description                                                    |
| ----------- | -------- | -------------------------------------------------------------- |
| name        | String   | Unique campaign name                                           |
| segmentId   | ObjectId | Target segment                                                 |
| channel     | String   | `email`, `sms`, `push`, `whatsapp`, `other`                  |
| message     | String   | Campaign message body (max 2000 chars)                         |
| status      | String   | `draft`, `scheduled`, `sent`, `failed`, `paused`, `archived`  |
| scheduledAt | Date     | Optional future send time                                      |
| createdBy   | ObjectId | Optional reference to User                                     |
| meta        | Mixed    | Internal metadata (excluded from JSON output)                  |

### Communication Log

Tracks individual message delivery per customer per campaign.

| Field         | Type     | Description                                           |
| ------------- | -------- | ----------------------------------------------------- |
| campaignId    | ObjectId | Reference to Campaign                                 |
| customerId    | ObjectId | Reference to Customer                                 |
| channel       | String   | Delivery channel                                      |
| status        | String   | `pending`, `sent`, `failed`, `delivered`, `opened`    |
| sentAt        | Date     | When the message was sent                             |
| deliveredAt   | Date     | When delivery was confirmed                           |
| openedAt      | Date     | When the message was opened                           |
| failureReason | String   | Reason if delivery failed                             |
| meta          | Mixed    | Internal metadata (excluded from JSON output)         |

## Validation Schemas

Request validation is defined with Joi in `backend/src/validation/`. Each resource has separate create and update schemas:

| Resource           | Create schema                      | Update schema                      |
| ------------------ | ---------------------------------- | ---------------------------------- |
| Customer           | `customerCreateSchema`             | `customerUpdateSchema`             |
| Order              | `orderCreateSchema`                | `orderUpdateSchema`                |
| Segment            | `segmentCreateSchema`              | `segmentUpdateSchema`              |
| Campaign           | `campaignCreateSchema`             | `campaignUpdateSchema`             |
| Communication Log  | `communicationLogCreateSchema`     | `communicationLogUpdateSchema`     |

Update schemas require at least one field. These schemas are ready to be wired into route middleware once REST endpoints are implemented.

## Entity Relationships

```
Customer ──< Order
Segment  ──< Campaign ──< Communication_Log >── Customer
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [MongoDB](https://www.mongodb.com/) — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/peeyushtyagi09/XENO.git
   cd XENO/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory:

   ```env
   PORT=5000
   mongoDB_URI=mongodb://localhost:27017/xeno
   ```

   For MongoDB Atlas, use your connection string:

   ```env
   mongoDB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/xeno
   ```

4. Start the server:

   ```bash
   node index.js
   ```

5. Verify the server is running:

   ```bash
   curl http://localhost:5000/
   ```

   Expected response: `Hello ji..`

### Seed Sample Data

To populate the database with 100 sample customers (uses `@faker-js/faker`):

```bash
node seed.js
```

This clears existing customers and inserts fresh sample records. Make sure MongoDB is running and your `.env` is configured before seeding.

## Environment Variables

| Variable      | Required | Description                        |
| ------------- | -------- | ---------------------------------- |
| `PORT`        | Yes      | Port the Express server listens on |
| `mongoDB_URI` | Yes      | MongoDB connection string          |

Environment variables are loaded via `dotenv` in `backend/example.env.js`.

## API Endpoints

| Method | Path | Description        |
| ------ | ---- | ------------------ |
| GET    | `/`  | Health check route |

> REST endpoints for customers, orders, segments, campaigns, and communication logs are not yet implemented. Joi validation schemas are ready for use when routes are added.

## Roadmap

- [x] Mongoose models for all core entities
- [x] Joi validation schemas (create/update) for all models
- [x] Database seed script for sample customers
- [ ] REST API routes and controllers for all models
- [ ] Validation middleware wired to routes
- [ ] Campaign scheduling and delivery worker
- [ ] Segment evaluation engine (apply criteria to customers)
- [ ] Authentication and authorization
- [ ] Frontend dashboard

## License

This project does not yet specify a license.

## Author

[peeyushtyagi09](https://github.com/peeyushtyagi09)
