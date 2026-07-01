# Blinkit Clone with Smart Budget Shopping System

Welcome to the **Blinkit Clone**! This project is a complete, responsive, full-stack grocery delivery web application inspired by Blinkit, featuring a **Smart Budget Shopping System** as the core differentiator. 

The application is structured with a robust Java 21 / Spring Boot REST API backend, a reactive Vite + React + TypeScript + Tailwind CSS frontend, Redis caching, MySQL storage, and Docker Compose orchestration.

---

## 🌟 Unique Feature: Smart Budget Shopping System
Unlike standard e-commerce platforms, this clone introduces a business-logic-driven budget constraint to help users stay within a predefined spending goal:
1. **Budget Setup Flow**: On application opening, users are prompted with a sleek modal to set a custom budget or select presets (₹500, ₹1000, ₹2000, ₹5000) for either their current Shopping Session, Weekly, or Monthly limits.
2. **Dynamic recommendations**: When browsing categories, products are sorted by budget compliance. Items fitting within the remaining budget are prioritized and surfaced first.
3. **Smart Search partitioning**: Searching items (e.g. "milk", "rice") splits results into "Recommended For Your Budget" and "Other Available Options" categories.
4. **Cheaper alternatives**: Adding a premium item to the cart checks for cheaper products in the same category and prompts the user with an inline swap option (e.g. *"Swap for Brand B and save ₹80"*).
5. **Real-time budget tracker**: The header displays a visual tracker showing Limit, Total Cart, and Remaining Budget (transitioning to yellow on low funds and red when exceeded).
6. **Budget Overflow Assistant**: If the cart exceeds the budget limit, a banner detailing how much the budget was exceeded by is triggered. It surfaces the heaviest items in the cart and recommends quick-swaps to balance the budget.

---

## 🏗️ Architecture Layout

```
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/blinkitclone/api/
│       ├── config/           # Security, Redis, OpenAPI specifications
│       ├── controller/       # REST controllers (Auth, Budget, Orders, etc.)
│       ├── dto/              # Unified DTO patterns
│       ├── entity/           # JPA entities
│       ├── exception/        # Custom global handlers
│       ├── repository/       # Data Access Layer
│       ├── security/         # JWT parsing and Spring Security filters
│       └── service/          # Business logic implementations
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf            # Reverse proxy setup for docker builds
│   ├── package.json
│   ├── tailwind.config.js    # Custom branding themes
│   └── src/
│       ├── components/       # Budget Popup, Tracker, Overflow widgets
│       ├── pages/            # Home, Cart, Checkout, Profile dashboards
│       ├── services/         # Axios api clients
│       ├── store/            # Redux ToolKit slices
│       └── types/            # TypeScript interfaces
├── docker-compose.yml        # Multi-service setup
└── .env.example              # Development environment configurations
```

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- Alternatively (for local manual run):
  - Java 21 JDK & Maven
  - Node.js v18+ & NPM
  - MySQL Server & Redis Server

### Setup and Running (Using Docker - Recommended)
1. Clone the project and navigate to the directory.
2. Copy the environment variables template:
   ```bash
   cp .env.example .env
   ```
3. Boot up the entire stack:
   ```bash
   docker-compose up --build
   ```
4. Access the web applications:
   - **Frontend UI**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8080](http://localhost:8080)
   - **Swagger Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

## ⚙️ Configuration & Credentials Checklist
To move from local mocks to production, the developer should review the following keys inside the `.env` file:

- **MySQL Database**: Adjust `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.
- **Redis Cache**: Adjust `REDIS_HOST`, `REDIS_PORT`, and `REDIS_PASSWORD` if connecting to cloud cache clusters.
- **SMTP Mail Server**: Replace `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, and `SMTP_PASSWORD` with active mail configurations (e.g., Mailtrap, Gmail SMTP) to trigger physical order invoices and confirmations.
- **Payment Gateways**:
  - **Stripe**: Define `VITE_STRIPE_PUBLIC_KEY` in the environment to connect frontend inputs to real checkout sessions.
  - **Razorpay**: Define `VITE_RAZORPAY_KEY_ID` to initialize live popup screens.
- **JWT Key**: Change `JWT_SECRET` to a secure 256-bit secret key for JWT validation.

---

## 🧪 Verification Plan

### Automated Build Verification
Verify compilation and package packaging:
- **Backend Maven Check**:
  ```bash
  cd backend
  mvn clean compile
  ```
- **Frontend Vite Build Check**:
  ```bash
  cd frontend
  npm run build
  ```

### Manual Testing Guide
1. **Register & Log In**: Visit the portal, click "Login" and sign up a new account.
2. **Budget Setup**: The popup will prompt you to set a budget. Type `1500` as a Session budget. Notice the tracker appears in the header.
3. **Smart Search**: Search "Milk". Products within budget appear at the top.
4. **Cheaper Alternatives**: Go to Categories, add high-price items to the cart, then review the inline recommendations advising on cheaper items. Swap them to verify immediate cart updates and budget adjustments.
5. **Overflow warning**: Exceed your ₹1500 budget limit in the cart. Notice the `BudgetOverflowAssistant` listing items to delete and swaps to make.
6. **Checkout**: Select an address, choose COD, and submit the order. The session budget resets, orders are tracked under the Profile page, and mail confirmations are logged.
