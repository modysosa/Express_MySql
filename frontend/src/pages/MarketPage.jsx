import { useEffect, useMemo, useRef, useState } from "react";

const symbols = [
  "btcusdt",
  "ethusdt",
  "bnbusdt",
  "solusdt",
  "xrpusdt",
  "adausdt",
  "dogeusdt",
  "maticusdt",
  "ltcusdt",
  "linkusdt",
];

const formatValue = (value) => {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }

    return value.toLocaleString(undefined, { maximumFractionDigits: 8 });
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

const detailRequests = [
  {
    key: "priceTicker",
    label: "Price Ticker",
    method: "ticker.price",
    params: {},
  },
  {
    key: "bookTicker",
    label: "Book Ticker",
    method: "ticker.book",
    params: {},
  },
  {
    key: "orderBook",
    label: "Order Book",
    method: "depth",
    params: { limit: 20 },
  },
];

const MarketPage = () => {
  const [prices, setPrices] = useState({});
  const [status, setStatus] = useState("Connecting...");
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [detailsResponse, setDetailsResponse] = useState(null);

  const requestIdRef = useRef(0);

  const streamUrl = useMemo(() => {
    const streams = symbols.map((s) => `${s}@ticker`).join("/");
    return `wss://stream.binance.com:9443/stream?streams=${streams}`;
  }, []);

  useEffect(() => {
    const ws = new WebSocket(streamUrl);

    ws.onopen = () => setStatus("Connected");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const data = message.data;

      setPrices((prev) => ({
        ...prev,
        [data.s]: {
          symbol: data.s,
          lastPrice: Number(data.c),
          priceChange: Number(data.p),
          priceChangePercent: Number(data.P),
          high: Number(data.h),
          low: Number(data.l),
          volume: Number(data.v),
          quoteVolume: Number(data.q),
          trades: data.n,
          time: new Date(data.E).toLocaleTimeString(),
        },
      }));
    };

    ws.onerror = () => setStatus("Socket error");
    ws.onclose = () => setStatus("Disconnected");

    return () => ws.close();
  }, [streamUrl]);

  const fetchSymbolDetails = (symbol) => {
    const upperSymbol = symbol.toUpperCase();
    setSelectedSymbol(upperSymbol);
    setDetailsLoading(true);
    setDetailsError("");

    const detailsSocket = new WebSocket("wss://ws-fapi.binance.com/ws-fapi/v1");
    const pending = new Map();
    const sections = {};

    detailRequests.forEach((req) => {
      const id = `${Date.now()}-${requestIdRef.current++}`;
      pending.set(id, req);
    });

    const closeSocket = () => {
      if (
        detailsSocket.readyState === WebSocket.OPEN ||
        detailsSocket.readyState === WebSocket.CONNECTING
      ) {
        detailsSocket.close();
      }
    };

    const finish = () => {
      setDetailsLoading(false);
      setDetailsResponse({
        symbol: upperSymbol,
        sections,
      });
      closeSocket();
    };

    const timeout = setTimeout(() => {
      setDetailsLoading(false);
      setDetailsError("Request timed out while loading details.");
      setDetailsResponse({ symbol: upperSymbol, sections });
      closeSocket();
    }, 10000);

    detailsSocket.onopen = () => {
      pending.forEach((req, id) => {
        detailsSocket.send(
          JSON.stringify({
            id,
            method: req.method,
            params: {
              symbol: upperSymbol,
              ...req.params,
            },
          }),
        );
      });
    };

    detailsSocket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const req = pending.get(payload.id);

      if (!req) {
        return;
      }

      sections[req.key] = {
        key: req.key,
        label: req.label,
        method: req.method,
        payload,
      };

      pending.delete(payload.id);

      if (payload.status && payload.status !== 200) {
        setDetailsError((prev) => {
          const base = prev ? `${prev} ` : "";
          const msg = payload.error?.msg || `Status ${payload.status}`;
          return `${base}${req.label}: ${msg}`.trim();
        });
      }

      if (pending.size === 0) {
        clearTimeout(timeout);
        finish();
      }
    };

    detailsSocket.onerror = () => {
      clearTimeout(timeout);
      setDetailsLoading(false);
      setDetailsError("Failed to load details from WebSocket API.");
      setDetailsResponse({ symbol: upperSymbol, sections });
      closeSocket();
    };

    detailsSocket.onclose = () => {
      clearTimeout(timeout);
    };
  };

  const rows = symbols.map((s) => prices[s.toUpperCase()]).filter(Boolean);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Live Binance Market Socket
          </h2>
          <p className="text-sm text-slate-500">
            Fast streaming prices from Binance WebSocket
          </p>
        </div>

        <span
          className={`rounded-lg px-4 py-1 text-sm font-semibold border ${
            status === "Connected"
              ? "bg-green-100 text-green-700 border-green-300"
              : status === "Disconnected"
                ? "bg-red-100 text-red-700 border-red-300"
                : status === "Socket error"
                  ? "bg-orange-100 text-orange-700 border-orange-300"
                  : "bg-yellow-100 text-yellow-700 border-yellow-300"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-slate-600">
              <th className="px-4 py-3">Symbol</th>
              <th className="px-4 py-3">Last Price</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Change %</th>
              <th className="px-4 py-3">High</th>
              <th className="px-4 py-3">Low</th>
              <th className="px-4 py-3">Volume</th>
              <th className="px-4 py-3">Trades</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={row.symbol} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">
                  <button
                    type="button"
                    onClick={() => fetchSymbolDetails(row.symbol)}
                    className="rounded px-1 text-brand-600 underline decoration-dotted underline-offset-4 hover:text-brand-700"
                  >
                    {row.symbol}
                  </button>
                </td>
                <td className="px-4 py-3">{row.lastPrice.toLocaleString()}</td>
                <td className="px-4 py-3">{row.priceChange.toFixed(4)}</td>
                <td
                  className={`px-4 py-3 font-semibold ${
                    row.priceChangePercent >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {row.priceChangePercent.toFixed(2)}%
                </td>
                <td className="px-4 py-3">{row.high.toLocaleString()}</td>
                <td className="px-4 py-3">{row.low.toLocaleString()}</td>
                <td className="px-4 py-3">{row.volume.toFixed(2)}</td>
                <td className="px-4 py-3">{row.trades}</td>
                <td className="px-4 py-3 text-slate-500">{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          Waiting for market data...
        </p>
      )}

      {(selectedSymbol ||
        detailsLoading ||
        detailsError ||
        detailsResponse) && (
        <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Symbol Details {selectedSymbol ? `- ${selectedSymbol}` : ""}
            </h3>
            {detailsLoading && (
              <span className="text-xs font-semibold text-brand-600">
                Loading...
              </span>
            )}
          </div>

          {detailsError && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {detailsError}
            </p>
          )}

          {detailsResponse && (
            <div className="space-y-4">
              {Object.values(detailsResponse.sections).map((section) => {
                const result = section.payload?.result;
                const entries =
                  result && !Array.isArray(result)
                    ? Object.entries(result)
                    : [];

                return (
                  <div
                    key={section.key}
                    className="rounded-lg border border-slate-200 bg-white p-3"
                  >
                    <h4 className="mb-2 text-sm font-semibold text-slate-900">
                      {section.label} ({section.method})
                    </h4>

                    <div className="mb-3 grid gap-2 text-sm sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          ID
                        </p>
                        <p className="font-semibold text-slate-800">
                          {formatValue(section.payload?.id)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Status
                        </p>
                        <p className="font-semibold text-slate-800">
                          {formatValue(section.payload?.status)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Result Type
                        </p>
                        <p className="font-semibold text-slate-800">
                          {Array.isArray(result) ? "Array" : typeof result}
                        </p>
                      </div>
                    </div>

                    {entries.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b bg-slate-50 text-left text-slate-600">
                              <th className="px-3 py-2">Field</th>
                              <th className="px-3 py-2">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map(([key, value]) => (
                              <tr
                                key={key}
                                className="border-b border-slate-200"
                              >
                                <td className="px-3 py-2 font-medium text-slate-700">
                                  {key}
                                </td>
                                <td className="px-3 py-2 text-slate-900">
                                  {formatValue(value)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {Array.isArray(result?.bids) &&
                      Array.isArray(result?.asks) && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Top Bids
                            </h5>
                            <pre className="max-h-40 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-100">
                              {JSON.stringify(
                                result.bids.slice(0, 10),
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                          <div>
                            <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Top Asks
                            </h5>
                            <pre className="max-h-40 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-100">
                              {JSON.stringify(
                                result.asks.slice(0, 10),
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </div>
                      )}

                    {Array.isArray(section.payload?.rateLimits) &&
                      section.payload.rateLimits.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                          <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                            Rate Limits
                          </h5>
                          <table className="min-w-full border-collapse text-xs">
                            <thead>
                              <tr className="border-b bg-slate-50 text-left text-slate-600">
                                <th className="px-2 py-1">Type</th>
                                <th className="px-2 py-1">Interval</th>
                                <th className="px-2 py-1">Num</th>
                                <th className="px-2 py-1">Limit</th>
                                <th className="px-2 py-1">Count</th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.payload.rateLimits.map(
                                (limit, index) => (
                                  <tr
                                    key={`${section.method}-${limit.rateLimitType}-${index}`}
                                    className="border-b border-slate-200"
                                  >
                                    <td className="px-2 py-1">
                                      {formatValue(limit.rateLimitType)}
                                    </td>
                                    <td className="px-2 py-1">
                                      {formatValue(limit.interval)}
                                    </td>
                                    <td className="px-2 py-1">
                                      {formatValue(limit.intervalNum)}
                                    </td>
                                    <td className="px-2 py-1">
                                      {formatValue(limit.limit)}
                                    </td>
                                    <td className="px-2 py-1">
                                      {formatValue(limit.count)}
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                    {/* <div className="mt-3">
                      <h5 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">Raw Response</h5>
                      <pre className="max-h-44 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-100">
                        {JSON.stringify(section.payload, null, 2)}
                      </pre>
                    </div> */}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default MarketPage;
