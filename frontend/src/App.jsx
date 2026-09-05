import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://watchwise-1-0b24.onrender.com";

function App() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [lastChecked, setLastChecked] = useState(null);

  // --------------------------------------------------
  // NORMAL MARKET CHECK
  // --------------------------------------------------

  const checkMarket = async (stocksToCheck = stocks) => {
    if (stocksToCheck.length === 0) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/check`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Market check failed");
      }

      const data = await response.json();

      setLastChecked(data.checked_at);

      setStocks((currentStocks) =>
        currentStocks.map((stock) => {
          const result = data.results.find(
            (item) => item.symbol === stock.symbol
          );

          if (!result) {
            return stock;
          }

          return {
            ...stock,
            ...result,
          };
        })
      );

      setMessage("Market check completed successfully.");
    } catch (error) {
      console.error("Error checking market:", error);

      setMessage(
        "Unable to check market data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // DEMO MODE
  // --------------------------------------------------

  const runDemo = async () => {
    if (stocks.length === 0) {
      setMessage(
        "Add at least one stock before running Demo Mode."
      );
      return;
    }

    setDemoLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/demo`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Demo mode failed");
      }

      const data = await response.json();

      setLastChecked(data.checked_at);

      setStocks((currentStocks) =>
        currentStocks.map((stock) => {
          const result = data.results.find(
            (item) => item.symbol === stock.symbol
          );

          if (!result) {
            return stock;
          }

          return {
            ...stock,
            ...result,
          };
        })
      );

      setMessage(
        "Demo Mode completed — WatchWise found simulated meaningful changes."
      );
    } catch (error) {
      console.error("Error running demo:", error);

      setMessage(
        "Unable to run Demo Mode. Please check the backend."
      );
    } finally {
      setDemoLoading(false);
    }
  };

  // --------------------------------------------------
  // LOAD WATCHLIST
  // --------------------------------------------------

  const loadWatchlist = async () => {
    try {
      const response = await fetch(
        `${API_URL}/watchlist`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load watchlist"
        );
      }

      const data = await response.json();

      setStocks(data);

      if (data.length > 0) {
        await checkMarket(data);
      }
    } catch (error) {
      console.error(
        "Error loading watchlist:",
        error
      );

      setMessage(
        "Unable to connect to WatchWise backend."
      );
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  // --------------------------------------------------
  // ADD STOCK
  // --------------------------------------------------

  const handleAddStock = async (e) => {
    e.preventDefault();

    if (!symbol.trim() || !name.trim()) {
      setMessage(
        "Please enter both stock symbol and company name."
      );
      return;
    }

    try {
      const params = new URLSearchParams({
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
      });

      const response = await fetch(
        `${API_URL}/watchlist?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to add stock."
        );

        return;
      }

      const addedStock = data.stock || data;

      const updatedStocks = [
        ...stocks,
        addedStock,
      ];

      setStocks(updatedStocks);

      setSymbol("");
      setName("");

      setMessage(
        `${addedStock.symbol} added to your watchlist.`
      );

      await checkMarket(updatedStocks);
    } catch (error) {
      console.error(
        "Error adding stock:",
        error
      );

      setMessage(
        "Unable to add stock. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // REMOVE STOCK
  // --------------------------------------------------

  const handleRemoveStock = async (
    stockSymbol
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/watchlist/${stockSymbol}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Unable to remove stock."
        );

        return;
      }

      setStocks((prevStocks) =>
        prevStocks.filter(
          (stock) =>
            stock.symbol !== stockSymbol
        )
      );

      setMessage(
        `${stockSymbol} removed from your watchlist.`
      );
    } catch (error) {
      console.error(
        "Error removing stock:",
        error
      );

      setMessage(
        "Unable to remove stock. Please try again."
      );
    }
  };

  // --------------------------------------------------
  // FILTER
  // --------------------------------------------------

  const filteredStocks =
    stocks.filter((stock) => {
      const searchText =
        search.toLowerCase();

      return (
        stock.symbol
          .toLowerCase()
          .includes(searchText) ||
        stock.name
          .toLowerCase()
          .includes(searchText)
      );
    });

  const meaningfulChanges =
    stocks.filter(
      (stock) =>
        stock.meaningful === true
    );

  // --------------------------------------------------
  // FORMATTERS
  // --------------------------------------------------

  const formatChange = (
    change
  ) => {
    if (
      change === null ||
      change === undefined
    ) {
      return "—";
    }

    return `${
      change >= 0 ? "+" : ""
    }${change.toFixed(2)}%`;
  };

  const formatPrice = (
    price
  ) => {
    if (
      price === null ||
      price === undefined
    ) {
      return "—";
    }

    return `$${price.toFixed(2)}`;
  };

  const formatTime = (
    timestamp
  ) => {
    if (!timestamp) {
      return "—";
    }

    return new Date(
      timestamp
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const getStatusLabel = (
    status
  ) => {
    switch (status) {
      case "MAJOR":
        return "Major";

      case "SIGNIFICANT":
        return "Significant";

      case "HIGH":
        return "High";

      case "NORMAL":
        return "Normal";

      case "NEW":
        return "New";

      case "UNAVAILABLE":
        return "Unavailable";

      default:
        return (
          status || "Unknown"
        );
    }
  };

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "MAJOR":
        return "status major";

      case "SIGNIFICANT":
        return "status significant";

      case "HIGH":
        return "status meaningful";

      case "NORMAL":
        return "status normal";

      case "NEW":
        return "status new";

      case "UNAVAILABLE":
        return "status unavailable";

      default:
        return "status";
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div>

          <h1>
            WatchWise
          </h1>

          <p>
            Know what changed. Know what matters.
          </p>

        </div>

        <div className="header-actions">

          <button
            className="demo-button"
            onClick={runDemo}
            disabled={
              demoLoading ||
              loading ||
              stocks.length === 0
            }
          >
            {demoLoading
              ? "Running Demo..."
              : "Run Demo"}
          </button>

          <button
            className="check-button"
            onClick={() =>
              checkMarket()
            }
            disabled={
              loading ||
              demoLoading ||
              stocks.length === 0
            }
          >
            {loading
              ? "Checking..."
              : "Check Again"}
          </button>

        </div>

      </header>

      <main className="main-content">

        {/* MESSAGE */}

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {/* SUMMARY */}

        <section className="summary-section">

          <div className="summary-card">

            <span className="summary-label">
              Watching
            </span>

            <span className="summary-value">
              {stocks.length}
            </span>

            <span className="summary-description">
              {stocks.length === 1
                ? "stock"
                : "stocks"}{" "}
              in your watchlist
            </span>

          </div>

          <div className="summary-card">

            <span className="summary-label">
              Meaningful Changes
            </span>

            <span className="summary-value">
              {meaningfulChanges.length}
            </span>

            <span className="summary-description">
              {meaningfulChanges.length === 1
                ? "change needs"
                : "changes need"}{" "}
              your attention
            </span>

          </div>

          <div className="summary-card">

            <span className="summary-label">
              Last Checked
            </span>

            <span className="summary-value small">
              {formatTime(
                lastChecked
              )}
            </span>

            <span className="summary-description">
              Latest WatchWise check
            </span>

          </div>

        </section>

        {/* MEANINGFUL CHANGES */}

        <section className="changes-section">

          <div className="section-header">

            <div>

              <h2>
                Since your last check
              </h2>

              <p>
                Stocks with meaningful price movements
              </p>

            </div>

          </div>

          {meaningfulChanges.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                ✓
              </div>

              <h3>
                No meaningful changes
              </h3>

              <p>
                Everything looks normal since your last check.
              </p>

            </div>

          ) : (

            <div className="changes-grid">

              {meaningfulChanges.map(
                (stock) => (

                  <div
                    className="change-card"
                    key={stock.symbol}
                  >

                    <div className="change-card-top">

                      <div>

                        <div className="stock-symbol">
                          {stock.symbol}
                        </div>

                        <div className="stock-name">
                          {stock.name}
                        </div>

                      </div>

                      <span
                        className={getStatusClass(
                          stock.status
                        )}
                      >
                        {getStatusLabel(
                          stock.status
                        )}
                      </span>

                    </div>

                    <div className="change-price">
                      {formatPrice(
                        stock.price ??
                        stock.current_price
                      )}
                    </div>

                    <div
                      className={
                        stock.change_percent >= 0
                          ? "change-percent positive"
                          : "change-percent negative"
                      }
                    >
                      {formatChange(
                        stock.change_percent
                      )}
                    </div>

                    {/* ATTENTION SCORE */}

                    <div className="attention-section">

                      <div className="attention-header">

                        <span>
                          Attention Score 
                        </span>

                        <strong>
                          {stock.attention_score ?? 0}/100
                        </strong>

                      </div>

                      <div className="attention-bar">

                        <div
                          className="attention-fill"
                          style={{
                            width: `${
                              stock.attention_score ?? 0
                            }%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* EXPLANATION */}

                    {stock.explanation && (

                      <div className="explanation">

                        <strong>
                          Why it matters
                        </strong>

                        <p>
                          {stock.explanation}
                        </p>

                      </div>

                    )}

                    {/* MARKET CONTEXT */}

                    {stock.context && (

                      <div className="explanation">

                        <strong>
                          Market context
                        </strong>

                        <p>
                          {stock.context}
                        </p>

                      </div>

                    )}

                    {/* PREVIOUS PRICE */}

                    {stock.previous_price !== null &&
                      stock.previous_price !==
                        undefined && (

                        <div className="previous-price">

                          Previous:{" "}
                          {formatPrice(
                            stock.previous_price
                          )}

                        </div>

                    )}

                    {/* FRESHNESS */}

                    {stock.checked_at && (

                      <div className="stock-freshness">

                        Checked{" "}
                        {formatTime(
                          stock.checked_at
                        )}

                      </div>

                    )}

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* ADD STOCK */}

        <section className="add-section">

          <div className="section-header">

            <div>

              <h2>
                Add to Watchlist
              </h2>

              <p>
                Add a stock you want WatchWise to monitor.
              </p>

            </div>

          </div>

          <form
            className="add-form"
            onSubmit={
              handleAddStock
            }
          >

            <input
              type="text"
              placeholder="Symbol (e.g. AAPL)"
              value={symbol}
              onChange={(e) =>
                setSymbol(
                  e.target.value
                )
              }
            />

            <input
              type="text"
              placeholder="Company name (e.g. Apple)"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />

            <button type="submit">
              Add Stock
            </button>

          </form>

        </section>

        {/* WATCHLIST */}

        <section className="watchlist-section">

          <div className="section-header watchlist-header">

            <div>

              <h2>
                Your Watchlist
              </h2>

              <p>
                {stocks.length === 0
                  ? "No stocks added yet."
                  : `${stocks.length} ${
                      stocks.length === 1
                        ? "stock"
                        : "stocks"
                    } being watched`}
              </p>

            </div>

            {stocks.length > 0 && (

              <input
                className="search-input"
                type="text"
                placeholder="Search stocks..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            )}

          </div>

          {stocks.length === 0 ? (

            <div className="empty-state watchlist-empty">

              <div className="empty-icon">
                +
              </div>

              <h3>
                Your watchlist is empty
              </h3>

              <p>
                Add your first stock above to start monitoring meaningful changes.
              </p>

            </div>

          ) : filteredStocks.length === 0 ? (

            <div className="empty-state">

              <h3>
                No stocks found
              </h3>

              <p>
                Try searching for another symbol or company name.
              </p>

            </div>

          ) : (

            <div className="stock-list">

              {filteredStocks.map(
                (stock) => (

                  <div
                    className="stock-card"
                    key={stock.symbol}
                  >

                    <div className="stock-info">

                      <div className="stock-symbol">
                        {stock.symbol}
                      </div>

                      <div className="stock-name">
                        {stock.name}
                      </div>

                    </div>

                    <div>

                      <div className="stock-price">
                        {formatPrice(
                          stock.price ??
                          stock.current_price
                        )}
                      </div>

                      {stock.checked_at && (

                        <div className="stock-freshness">
                          Checked{" "}
                          {formatTime(
                            stock.checked_at
                          )}
                        </div>

                      )}

                    </div>

                    <div className="stock-change">

                      {stock.change_percent !== null &&
                      stock.change_percent !==
                        undefined ? (

                        <span
                          className={
                            stock.change_percent >= 0
                              ? "positive"
                              : "negative"
                          }
                        >
                          {formatChange(
                            stock.change_percent
                          )}
                        </span>

                      ) : (

                        <span className="unavailable-text">
                          Data unavailable
                        </span>

                      )}

                    </div>

                    <div className="stock-status">

                      <div className="watchlist-attention">

                        <div className="attention-score-row">

                          <span className="watchlist-score-label">
                            Attention
                          </span>

                          <strong>
                            {stock.attention_score ?? 0}
                          </strong>

                        </div>

                        <div className="watchlist-score-bar">

                          <div
                            className="watchlist-score-fill"
                            style={{
                              width: `${
                                stock.attention_score ?? 0
                              }%`,
                            }}
                          />

                        </div>

                      </div>

                      {stock.status && (

                        <span
                          className={getStatusClass(
                            stock.status
                          )}
                        >
                          {getStatusLabel(
                            stock.status
                          )}
                        </span>

                      )}

                    </div>

                    <button
                      className="remove-button"
                      onClick={() =>
                        handleRemoveStock(
                          stock.symbol
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                )
              )}

            </div>

          )}

        </section>

        {/* DATA NOTE */}

        <div className="data-note">

          <span>
            Market data:
          </span>{" "}
          Latest available market data

        </div>

      </main>

    </div>
  );
}

export default App;
