# WatchWise

### Know what changed. Know what matters.

WatchWise is an intelligent market monitoring dashboard that helps users identify which stocks in their watchlist actually deserve attention.

Instead of continuously scanning stock prices and trying to decide which movements are important, WatchWise compares market prices against previous checks, detects meaningful movements, assigns an Attention Score, and explains why the movement deserves attention.

---

## 🚀 Problem

Monitoring multiple stocks can quickly become information overload.

A user may have several stocks in their watchlist, but not every price movement is important. Small fluctuations are normal, while larger movements may require further investigation.

Traditional stock dashboards provide large amounts of market data, but users still have to determine:

- What changed?
- Was the change significant?
- Which stock should I look at first?
- Why does this movement matter?

WatchWise focuses on answering these questions quickly.

---

## 💡 Solution

WatchWise continuously compares the latest available market price with the previous recorded price for each stock.

It then:

1. Detects price movement.
2. Determines whether the movement is meaningful.
3. Classifies its severity.
4. Calculates an Attention Score.
5. Explains why the movement matters.
6. Presents the most important changes clearly on the dashboard.

### Core idea

> **Don't just show the user what changed. Tell them what deserves attention.**

---

## ✨ Key Features

### 📊 Personalized Watchlist

Users can add and remove stocks from their personal watchlist.

### 🔎 Meaningful Change Detection

WatchWise compares the latest price with the previous market snapshot and identifies unusual movements.

### 🚦 Severity Classification

Price movements are categorized into different levels:

- **NORMAL** — movement within the normal range
- **HIGH** — movement above the normal range
- **SIGNIFICANT** — stronger movement requiring more attention
- **MAJOR** — large movement that deserves immediate attention

### 🎯 Attention Score

Each meaningful movement receives an Attention Score from **0–100** based on the magnitude of the price movement.

Higher movement → Higher Attention Score.

### 💬 Explainable Insights

WatchWise doesn't stop at displaying a percentage change.

It provides a simple explanation such as:

> Price increased by 11.20%. This is a major upward movement and deserves immediate attention.

This makes the dashboard easier to understand for users who don't want to interpret raw market data themselves.

### 📈 Previous Price Comparison

The dashboard shows the previous recorded price alongside the latest price so users can immediately understand what changed.

### 🧪 Demo Mode

The **Run Demo** feature generates different market movement scenarios so the application's intelligence can be demonstrated without waiting for real market movements.

---

## 🖥️ Application Flow

```text
              ┌─────────────────┐
              │  User Watchlist │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Market Data     │
              │ Retrieval       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Compare with    │
              │ Previous Price  │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Detect Meaningful│
              │ Movement        │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Severity +      │
              │ Attention Score │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Explain Why It  │
              │ Matters         │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ WatchWise       │
              │ Dashboard       │
              └─────────────────┘

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite

### Market Data

- Yahoo Finance through `yfinance`

---

## 📁 Project Structure

```text
watchwise/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── main.py
│   ├── market.py
│   ├── requirements.txt
│   └── ...
│
└── README.md
```

---

# ⚙️ Setup & Installation

## Prerequisites

Make sure the following are installed:

- Python 3.10+
- Node.js 18+
- npm
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/PoojaEllanti/watchwise.git
cd watchwise
```

---

# 🔧 Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

FastAPI interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# 🎨 Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will provide a local URL, usually:

```text
http://localhost:5173
```

Open the URL in your browser.

---

# 🧪 Using WatchWise

## Step 1 — Add Stocks

Use the **Add to Watchlist** section to enter:

- Stock symbol
- Company name

Then click **Add Stock**.

---

## Step 2 — Check the Market

Click:

**Check Again**

WatchWise retrieves the latest available market data and compares it with the previous recorded snapshot.

---

## Step 3 — Review Meaningful Changes

Stocks with significant movements are highlighted on the dashboard.

Review:

- Current price
- Price change
- Previous price
- Severity
- Attention Score
- Explanation

---

## Step 4 — Run the Demo

Click:

**Run Demo**

This demonstrates different market movement scenarios and shows how WatchWise prioritizes them.

---

# 🎯 Attention Score

WatchWise calculates an Attention Score between **0 and 100** based on the absolute percentage movement.

The score increases as the magnitude of the movement increases.

```text
Small movement
      ↓
Low Attention
      ↓
Moderate movement
      ↓
Higher Attention
      ↓
Large movement
      ↓
High Attention
```

The purpose of the score is not to predict whether a stock will rise or fall.

Instead, it helps users quickly identify **which movements deserve investigation**.

---

# 🚦 Movement Classification

| Price Movement | Classification |
|----------------|----------------|
| Less than 2% | NORMAL |
| 2% – Less than 5% | HIGH |
| 5% – Less than 10% | SIGNIFICANT |
| 10% or more | MAJOR |

These thresholds are used to prioritize unusual movements in the WatchWise dashboard.

---

# 🧠 Why WatchWise?

Most market dashboards focus on displaying information.

WatchWise focuses on **prioritization**.

Instead of asking the user to constantly monitor:

```text
Stock A → +1.2%
Stock B → +2.4%
Stock C → +11.2%
Stock D → -0.8%
Stock E → -7.0%
```

WatchWise helps surface:

```text
🔴 Stock C → MAJOR → High Attention

🟠 Stock E → SIGNIFICANT → High Attention

🟡 Stock B → HIGH → Moderate Attention
```

This reduces information overload and gives the user a clear starting point for further investigation.

---

# 🧪 Demo Mode

The application includes a demo mode that simulates different market movements.

Example scenarios include:

```text
+2.8%
+6.4%
+11.2%
-7.0%
-12.5%
```

This allows the complete WatchWise workflow to be demonstrated even when live market conditions do not contain large movements.

---

# 🔌 API Endpoints

The FastAPI backend provides the following endpoints:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | API information |
| GET | `/health` | Backend health check |
| GET | `/watchlist` | Get watchlist |
| POST | `/watchlist` | Add a stock |
| DELETE | `/watchlist/{symbol}` | Remove a stock |
| POST | `/check` | Check market data |
| POST | `/demo` | Run demo market scenarios |

Interactive API documentation is available through FastAPI Swagger:

```text
http://127.0.0.1:8000/docs
```

---

# 🔮 Future Improvements

Potential future enhancements include:

- News and event correlation
- Earnings-event detection
- Sector-level movement analysis
- Market-wide context
- Historical trend visualization
- Custom attention thresholds
- Personalized notification preferences
- Advanced anomaly detection
- AI-generated event summaries

---

# 🎯 Project Goal

WatchWise is designed around a simple principle:

> **Know what changed. Know what matters.**

The goal is to transform raw market movements into prioritized and understandable signals, helping users spend less time monitoring data and more time investigating what actually matters.

---

## 👩‍💻 Project

**WatchWise**

**Know what changed. Know what matters.**

Built as an intelligent market-monitoring and prioritization solution focused on reducing information overload and helping users identify the stocks that deserve attention.
