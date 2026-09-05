from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime

from market import get_market_data


# ============================================================
# DATABASE SETUP
# ============================================================

DATABASE_URL = "sqlite:///./watchwise.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ============================================================
# DATABASE MODELS
# ============================================================

class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True)
    name = Column(String)


class MarketSnapshot(Base):
    __tablename__ = "market_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True)
    price = Column(Float)
    timestamp = Column(DateTime)


Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(title="WatchWise API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATABASE DEPENDENCY
# ============================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ============================================================
# BASIC ROUTES
# ============================================================

@app.get("/")
def root():
    return {
        "message": "WatchWise API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


# ============================================================
# WATCHLIST
# ============================================================

@app.get("/watchlist")
def get_watchlist(db: Session = Depends(get_db)):

    stocks = (
        db.query(WatchlistItem)
        .order_by(WatchlistItem.id.desc())
        .all()
    )

    return [
        {
            "id": stock.id,
            "symbol": stock.symbol,
            "name": stock.name
        }
        for stock in stocks
    ]


@app.post("/watchlist")
def add_to_watchlist(
    stock: dict,
    db: Session = Depends(get_db)
):

    symbol = stock.get("symbol", "").upper().strip()
    name = stock.get("name", symbol)

    if not symbol:
        return {
            "error": "Stock symbol is required"
        }

    existing = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.symbol == symbol)
        .first()
    )

    if existing:
        return {
            "message": "Stock already exists",
            "stock": {
                "id": existing.id,
                "symbol": existing.symbol,
                "name": existing.name
            }
        }

    new_stock = WatchlistItem(
        symbol=symbol,
        name=name
    )

    db.add(new_stock)
    db.commit()
    db.refresh(new_stock)

    return {
        "message": "Stock added successfully",
        "stock": {
            "id": new_stock.id,
            "symbol": new_stock.symbol,
            "name": new_stock.name
        }
    }


@app.delete("/watchlist/{symbol}")
def remove_from_watchlist(
    symbol: str,
    db: Session = Depends(get_db)
):

    symbol = symbol.upper().strip()

    stock = (
        db.query(WatchlistItem)
        .filter(WatchlistItem.symbol == symbol)
        .first()
    )

    if not stock:
        return {
            "error": "Stock not found"
        }

    db.delete(stock)
    db.commit()

    return {
        "message": f"{symbol} removed successfully"
    }


# ============================================================
# ATTENTION SCORE
# ============================================================

def calculate_attention_score(
    change_percent: float
) -> int:

    change = abs(change_percent)

    if change < 2:
        return 0

    if change < 5:
        score = 20 + ((change - 2) / 3) * 30
        return min(100, round(score))

    if change < 10:
        score = 50 + ((change - 5) / 5) * 30
        return min(100, round(score))

    if change < 15:
        score = 80 + ((change - 10) / 5) * 20
        return min(100, round(score))

    return 100


# ============================================================
# EXPLANATION
# ============================================================

def generate_explanation(
    change_percent: float,
    status: str
) -> str:

    movement = abs(change_percent)

    if change_percent > 0:
        direction = "increased"
        direction_text = "upward"

    elif change_percent < 0:
        direction = "decreased"
        direction_text = "downward"

    else:
        return (
            "No meaningful price movement has been detected."
        )

    if status == "MAJOR":
        return (
            f"Price {direction} by {movement:.2f}%. "
            f"This is a major {direction_text} movement "
            "and deserves immediate attention."
        )

    if status == "SIGNIFICANT":
        return (
            f"Price {direction} by {movement:.2f}%. "
            f"This significant {direction_text} movement "
            "may indicate increased market activity."
        )

    if status == "HIGH":
        return (
            f"Price {direction} by {movement:.2f}%. "
            f"This {direction_text} movement is above "
            "WatchWise's normal range."
        )

    return (
        f"Price {direction} by {movement:.2f}%. "
        "The movement is within the normal range."
    )


# ============================================================
# MARKET CONTEXT
# ============================================================

def generate_market_context(
    change_percent: float,
    status: str
) -> str:

    movement = abs(change_percent)

    if status == "MAJOR":
        return (
            "This movement is large enough to investigate "
            "possible company news, earnings, or broader "
            "market events."
        )

    if status == "SIGNIFICANT":
        return (
            "This movement may be associated with increased "
            "company or sector activity."
        )

    if status == "HIGH":
        return (
            "This movement is above the normal range and "
            "may be worth monitoring."
        )

    return (
        "No unusual market context is indicated by the "
        "current price movement."
    )


# ============================================================
# CHECK MARKET
# ============================================================

@app.post("/check")
def check_market(db: Session = Depends(get_db)):

    stocks = (
        db.query(WatchlistItem)
        .order_by(WatchlistItem.id.desc())
        .all()
    )

    results = []

    for stock in stocks:

        current = get_market_data(stock.symbol)

        # ----------------------------------------------------
        # MARKET DATA UNAVAILABLE
        # ----------------------------------------------------

        if not current:

            results.append({
                "symbol": stock.symbol,
                "name": stock.name,
                "price": None,
                "change_percent": 0,
                "status": "UNAVAILABLE",
                "meaningful": False,
                "attention_score": 0,
                "explanation": None,
                "context": None,
                "previous_price": None,
                "checked_at": None
            })

            continue

        current_price = current["price"]

        # ----------------------------------------------------
        # GET PREVIOUS SNAPSHOT
        # ----------------------------------------------------

        previous = (
            db.query(MarketSnapshot)
            .filter(
                MarketSnapshot.symbol == stock.symbol
            )
            .order_by(
                MarketSnapshot.timestamp.desc()
            )
            .first()
        )

        # ----------------------------------------------------
        # FIRST CHECK
        # ----------------------------------------------------

        if not previous:

            snapshot = MarketSnapshot(
                symbol=stock.symbol,
                price=current_price,
                timestamp=current["timestamp"]
            )

            db.add(snapshot)

            results.append({
                "symbol": stock.symbol,
                "name": stock.name,
                "price": round(current_price, 2),
                "change_percent": 0,
                "status": "NEW",
                "meaningful": False,
                "attention_score": 0,
                "explanation": (
                    "This is the first market check "
                    "for this stock."
                ),
                "context": (
                    "WatchWise will compare future checks "
                    "against this price."
                ),
                "previous_price": None,
                "checked_at": current["timestamp"]
            })

            continue

        # ----------------------------------------------------
        # CALCULATE CHANGE
        # ----------------------------------------------------

        change_percent = (
            (current_price - previous.price)
            / previous.price
        ) * 100

        movement = abs(change_percent)

        # ----------------------------------------------------
        # DETERMINE STATUS
        # ----------------------------------------------------

        if movement >= 10:
            status = "MAJOR"

        elif movement >= 5:
            status = "SIGNIFICANT"

        elif movement >= 2:
            status = "HIGH"

        else:
            status = "NORMAL"

        meaningful = movement >= 2

        attention_score = calculate_attention_score(
            change_percent
        )

        explanation = generate_explanation(
            change_percent,
            status
        )

        context = generate_market_context(
            change_percent,
            status
        )

        # ----------------------------------------------------
        # SAVE NEW SNAPSHOT
        # ----------------------------------------------------

        snapshot = MarketSnapshot(
            symbol=stock.symbol,
            price=current_price,
            timestamp=current["timestamp"]
        )

        db.add(snapshot)

        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        results.append({
            "symbol": stock.symbol,
            "name": stock.name,
            "price": round(current_price, 2),
            "change_percent": round(
                change_percent,
                2
            ),
            "status": status,
            "meaningful": meaningful,
            "attention_score": attention_score,
            "explanation": explanation,
            "context": context,
            "previous_price": round(
                previous.price,
                2
            ),
            "checked_at": current["timestamp"]
        })

    db.commit()

    return {
        "checked_at": datetime.utcnow(),
        "results": results
    }


# ============================================================
# DEMO MODE
# ============================================================

@app.post("/demo")
def demo_market(
    db: Session = Depends(get_db)
):

    stocks = (
        db.query(WatchlistItem)
        .order_by(WatchlistItem.id.desc())
        .all()
    )

    demo_changes = [
        2.8,
        6.4,
        11.2,
        -7.0,
        -12.5
    ]

    results = []

    for index, stock in enumerate(stocks):

        # ----------------------------------------------------
        # GET PREVIOUS PRICE
        # ----------------------------------------------------

        previous = (
            db.query(MarketSnapshot)
            .filter(
                MarketSnapshot.symbol == stock.symbol
            )
            .order_by(
                MarketSnapshot.timestamp.desc()
            )
            .first()
        )

        if previous:
            base_price = previous.price
        else:
            base_price = 100.0

        # ----------------------------------------------------
        # APPLY DEMO CHANGE
        # ----------------------------------------------------

        change_percent = demo_changes[
            index % len(demo_changes)
        ]

        current_price = (
            base_price *
            (1 + change_percent / 100)
        )

        movement = abs(change_percent)

        # ----------------------------------------------------
        # DETERMINE STATUS
        # ----------------------------------------------------

        if movement >= 10:
            status = "MAJOR"

        elif movement >= 5:
            status = "SIGNIFICANT"

        elif movement >= 2:
            status = "HIGH"

        else:
            status = "NORMAL"

        meaningful = movement >= 2

        attention_score = calculate_attention_score(
            change_percent
        )

        explanation = generate_explanation(
            change_percent,
            status
        )

        context = generate_market_context(
            change_percent,
            status
        )

        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        results.append({
            "symbol": stock.symbol,
            "name": stock.name,
            "price": round(current_price, 2),
            "change_percent": round(
                change_percent,
                2
            ),
            "status": status,
            "meaningful": meaningful,
            "attention_score": attention_score,
            "explanation": explanation,
            "context": context,
            "previous_price": round(
                base_price,
                2
            ),
            "checked_at": datetime.utcnow()
        })

    return {
        "mode": "demo",
        "message": (
            "Demo market movements generated "
            "successfully."
        ),
        "results": results
    }