<div align="center">

```
███████╗██╗███╗   ██╗██╗  ██╗   ██╗
██╔════╝██║████╗  ██║██║  ╚██╗ ██╔╝
█████╗  ██║██╔██╗ ██║██║   ╚████╔╝ 
██╔══╝  ██║██║╚██╗██║██║    ╚██╔╝  
██║     ██║██║ ╚████║███████╗██║   
╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝   
```

**Your money. Your patterns. Your future.**

[![Expo](https://img.shields.io/badge/Expo-SDK%2051-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-6C63FF?style=for-the-badge)](LICENSE)

[Features](#-features) · [Screenshots](#-screenshots) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [API Docs](#-api-reference) · [Deploy](#-deployment)

</div>

---

## 📖 Overview

**Finly** is a behavioral finance companion app that goes beyond basic expense tracking. Instead of just showing where your money went, Finly analyzes *how* and *when* you spend — detecting patterns, scoring your financial habits, and projecting the long-term impact of your daily choices.

It feels like having a lightweight financial coach in your pocket: no complex setup, no bank integrations, just intelligent rule-based analysis of your own spending data presented through a premium, dark-themed mobile experience.

> **Built as part of a mobile developer internship assessment** — demonstrating strong product thinking, clean architecture, rich UI/UX, and full-stack integration.

---

## ✨ Features

### 🏠 Smart Dashboard
- Live balance, income, and expense summary
- Animated weekly spending bar chart
- Category breakdown donut chart
- Behavioral nudge card with personalized insights
- Habit Score ring (0–100) with streak tracker
- Recent transactions and active goals preview

### 💸 Transaction Tracking
- Add income and expenses in under 5 seconds
- 8 spending categories with custom icons
- Optional mood tagging per transaction (😄 😊 😐 😟 😠)
- Full edit and delete support
- Swipe-to-delete with undo confirmation
- Filter by type, category, and date range
- Search across all transactions

### 🧠 Behavior Engine (Core Differentiator)
- **Day-of-week analysis** — detects overspending patterns on specific days
- **Peak time detection** — morning / afternoon / evening / night breakdown
- **Weekend vs weekday** spending comparison
- **Category spike alerts** — flags unusual week-over-week changes
- **Small purchase detection** — surfaces mindless micro-spending
- **Weekly financial habit score** — calculated across 4 dimensions:
  - Budget Adherence
  - Tracking Consistency
  - Savings Progress
  - Spending Control

### 📊 Insights Screen
- Period selector: This Week / This Month / 3 Months
- Horizontal category breakdown bar chart
- Income vs expense trend line chart
- Key insight cards (top category, peak day, spending changes)
- **Future Impact Projector** — interactive slider that calculates yearly savings from small habit changes (e.g. "Reduce food by 20% → save ₹28,800/year")

### 🎯 Goals & Gamification
- Create savings goals with emoji, target, and deadline
- Animated progress bars with motivational milestone messages
- Habit streak tracker with 30-day heatmap calendar
- **Weekly Challenges** — auto-generated based on top spending categories
- **8 Achievement Badges** — unlocked through real app usage:
  - 🌱 First Step · 📅 Week Warrior · 🎯 Goal Setter · 💰 Saver
  - 🧠 Budget Boss · 🏆 Centurion · ⚡ Streak Master · 🦋 Transformation

### 🎨 Premium UI/UX
- Dark-first design with full light mode toggle
- Inter font family throughout
- Smooth Reanimated 3 animations on all screens
- Animated number counters and chart entrances
- Skeleton shimmer loading states
- Friendly empty states on all list screens
- Haptic feedback on key interactions
- Safe area and gesture handler support

---

## 📱 Screenshots

> _Screenshots to be added after final build. Run the app locally to preview all screens._

| Dashboard | Transactions | Insights |
|-----------|-------------|---------|
| _(coming soon)_ | _(coming soon)_ | _(coming soon)_ |

| Goals | Behavior Coach | Profile |
|-------|---------------|---------|
| _(coming soon)_ | _(coming soon)_ | _(coming soon)_ |

---

## 🏗 Architecture

### Frontend Architecture

Finly uses a **feature-first folder structure** with a clean separation between UI, state, and data layers:

```
app/                    ← Expo Router pages (routing only)
src/
  components/           ← UI components grouped by feature
  store/                ← Zustand stores (auth, settings, UI)
  api/                  ← Axios API layer (one file per resource)
  hooks/                ← React Query hooks (server state)
  utils/                ← Pure logic (behavior engine, formatters)
  constants/            ← Design tokens (colors, typography, spacing)
  types/                ← TypeScript interfaces
```

**State Management Strategy:**

| State Type | Tool | Reason |
|-----------|------|--------|
| Server data (transactions, goals) | React Query (TanStack) | Caching, background refetch, loading/error states |
| Auth state + token | Zustand + expo-secure-store | Persisted, synchronous access |
| UI state (modals, theme) | Zustand | Lightweight, no boilerplate |
| Form state | react-hook-form + zod | Validation, field-level errors |

### Backend Architecture

```
app/
  models/       ← Beanie Documents (MongoDB ODM)
  schemas/      ← Pydantic v2 request/response schemas
  routers/      ← FastAPI route handlers (thin layer)
  services/     ← Business logic (insights, behavior, auth)
  dependencies  ← Auth guard, DB session injection
```

All business logic lives in `services/` — routers only handle HTTP concerns. The behavior and insights engines are pure Python functions with no external dependencies.

### Key Design Decisions

- **MongoDB over SQL** — transactions and behavioral insights are document-shaped, schema-flexible, and don't benefit from relational joins at this scale. MongoDB Atlas free tier also makes zero-config cloud deployment trivial.
- **Beanie ODM** — gives Pydantic v2 model definitions that double as both database schemas and API response models, eliminating duplication.
- **React Query for server state** — removes the need for manual loading/error/refetch logic in every component. Data stays fresh with background polling.
- **Expo managed workflow** — fastest path to a working iOS + Android build without native configuration. EAS Build handles distribution.
- **Rule-based behavior engine** — all "smart" insights are deterministic Python/TypeScript functions on raw transaction data. No ML, no external API, fully explainable.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for quick preview) OR Android/iOS simulator
- Python 3.11+ (for backend)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/finly.git
cd finly
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Set your backend URL in .env
# EXPO_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
# (Use http://localhost:8000/api/v1 for local development)
```

```bash
# Start the Expo development server
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android emulator / `i` for iOS simulator.

### 3. Backend Setup

```bash
cd finly-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/finly
SECRET_KEY=your-minimum-32-character-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ENVIRONMENT=development
```

```bash
# Start the development server
uvicorn app.main:app --reload --port 8000
```

API is now live at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

---

## 🧪 Running with Mock Data

The app includes 30 pre-built sample transactions, 3 goals, and 8 badges so you can preview all features without a backend connection.

In `src/constants/appConstants.ts`, set:

```ts
export const USE_MOCK_DATA = true;
```

The app will use local mock data for all screens. Set back to `false` to connect to the real API.

---

## 📁 Environment Variables

### Frontend (`.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend base URL | `https://finly-api.onrender.com/api/v1` |

### Backend (`.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URL` | ✅ | MongoDB Atlas connection string |
| `SECRET_KEY` | ✅ | JWT signing secret (min 32 chars) |
| `ALGORITHM` | ✅ | JWT algorithm (`HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | ✅ | Token TTL in minutes (`10080` = 7 days) |
| `ENVIRONMENT` | ✅ | `development` or `production` |

---

## 🌐 API Reference

All endpoints are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>` header.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Create new account |
| `POST` | `/auth/login` | Login, returns JWT |
| `GET` | `/auth/me` | Get current user |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/transactions` | List with filters (date, category, type) |
| `POST` | `/transactions` | Create transaction |
| `PUT` | `/transactions/{id}` | Update transaction |
| `DELETE` | `/transactions/{id}` | Delete transaction |

### Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/goals` | List all goals |
| `POST` | `/goals` | Create goal |
| `PUT` | `/goals/{id}` | Update goal / add savings |
| `DELETE` | `/goals/{id}` | Delete goal |

### Insights

| Method | Endpoint | Query Params | Description |
|--------|----------|-------------|-------------|
| `GET` | `/insights/summary` | `period=week\|month\|3months` | Income, expenses, savings rate |
| `GET` | `/insights/categories` | `period` | Spending by category |
| `GET` | `/insights/trend` | `period` | Daily income vs expense points |
| `GET` | `/insights/weekly-chart` | — | Last 7 days bar chart data |

### Behavior

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/behavior/score` | Habit score + breakdown |
| `GET` | `/behavior/patterns` | Detected spending patterns |
| `GET` | `/behavior/challenges` | This week's challenges |
| `GET` | `/behavior/badges` | All badges with unlock status |

Full interactive documentation available at `/docs` (Swagger UI) when the backend is running.

---

## ☁️ Deployment

### Deploy Backend to Render.com

1. **Create a MongoDB Atlas cluster**
   - Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Create a free M0 cluster
   - Create a database user and whitelist `0.0.0.0/0` (allow all IPs for Render)
   - Copy the connection string

2. **Push backend to GitHub**
   ```bash
   cd finly-backend
   git init && git add . && git commit -m "initial commit"
   git remote add origin https://github.com/yourusername/finly-backend.git
   git push -u origin main
   ```

3. **Create Render Web Service**
   - Go to [render.com](https://render.com) → New → Web Service
   - Connect your GitHub repository
   - Set the following:
     - **Root directory:** `finly-backend`
     - **Build command:** `pip install -r requirements.txt`
     - **Start command:** `gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

4. **Set environment variables on Render**
   - `MONGODB_URL` → your Atlas connection string
   - `SECRET_KEY` → generate with `python -c "import secrets; print(secrets.token_hex(32))"`
   - `ALGORITHM` → `HS256`
   - `ACCESS_TOKEN_EXPIRE_MINUTES` → `10080`
   - `ENVIRONMENT` → `production`

5. **Deploy** — Render auto-deploys on every push to `main`.

### Build Mobile App with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure the project
eas build:configure

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account)
eas build --platform ios
```

---

## 🧠 Behavior Engine — How It Works

The behavior engine (`src/utils/behaviorEngine.ts`) is a pure TypeScript module that runs deterministic analysis on raw transaction data. No external APIs or ML models are used.

### Pattern Detection Logic

**Day-of-week overspending:** Groups transactions by weekday, calculates average spend, flags any day exceeding 1.5× the average.

**Peak time detection:** Classifies each transaction by hour into morning (6–12), afternoon (12–17), evening (17–22), or night (22–6). Returns the slot with highest transaction count.

**Weekend vs weekday:** Compares average daily spend across weekends vs weekdays. Flags if weekend is more than 1.4× weekday average.

**Category spikes:** Compares this week's category percentages to last week's. Flags any category that grew more than 30%.

### Habit Score Calculation

The score is computed across four dimensions, each scored out of 25:

```
Budget Adherence (25pts)   → % of days where daily spend < (monthlyBudget ÷ 30)
Tracking Consistency (25pts) → days with ≥1 transaction in last 14 days ÷ 14
Savings Progress (25pts)   → average % completion across all active goals
Spending Control (25pts)   → income-to-expense ratio (linear 0–25)
─────────────────────────────────────────────────────────────────
Total Habit Score (0–100)
```

---

## 📦 Key Dependencies

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | 51+ | Managed React Native platform |
| `expo-router` | 3.x | File-based navigation |
| `zustand` | 4.x | Client state management |
| `@tanstack/react-query` | 5.x | Server state + caching |
| `axios` | 1.x | HTTP client with interceptors |
| `react-native-gifted-charts` | latest | Bar, line, pie charts |
| `react-native-reanimated` | 3.x | Smooth animations |
| `moti` | 0.x | Declarative animations |
| `@gorhom/bottom-sheet` | 4.x | Transaction input sheets |
| `react-hook-form` | 7.x | Form state management |
| `zod` | 3.x | Schema validation |
| `date-fns` | 3.x | Date formatting and math |
| `expo-haptics` | latest | Tactile feedback |
| `expo-secure-store` | latest | Encrypted JWT storage |

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | 0.110+ | Web framework |
| `beanie` | 1.x | Async MongoDB ODM |
| `motor` | 3.x | Async MongoDB driver |
| `pydantic` | v2 | Data validation |
| `python-jose` | 3.x | JWT encoding/decoding |
| `passlib[bcrypt]` | 1.x | Password hashing |
| `uvicorn` | 0.27+ | ASGI server |
| `gunicorn` | 21.x | Production process manager |

---

## 🗂 What Makes Finly Different

Most finance apps are glorified spreadsheets. Finly is different in three concrete ways:

**1. It tells you *why*, not just *what*.**  
Instead of "you spent ₹8,000 on food", Finly tells you "your food spending spikes every Friday — that's 40% above your weekly average." Behavioral context makes insights actionable.

**2. It scores your discipline like a fitness tracker scores steps.**  
The Habit Score gives users a single number that summarizes their financial behavior across four dimensions. It's immediately understandable and motivating in a way that raw numbers aren't.

**3. It connects today's habits to tomorrow's outcomes.**  
The Future Impact Projector lets users move a slider and instantly see how a small change compounds over a year. "Save ₹200 on coffee 5× a week → ₹52,000 saved in a year → a trip to Goa." That's a behavior change trigger, not just data.

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a pull request
```

Follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ♥ for the internship assessment · **Finly v1.0.0**

</div>
