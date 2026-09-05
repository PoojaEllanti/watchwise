from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime

from database import Base


class WatchlistItem(Base):
    __tablename__ = "watchlist"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MarketSnapshot(Base):
    __tablename__ = "market_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String, index=True, nullable=False)

    price = Column(Float, nullable=False)

    checked_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )