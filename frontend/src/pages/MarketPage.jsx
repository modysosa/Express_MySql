import { useEffect, useMemo, useState } from "react";

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

const MarketPage = () => {
  const [prices, setPrices] = useState({});
  const [status, setStatus] = useState("Connecting...");

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

  const rows = symbols.map((s) => prices[s.toUpperCase()]).filter(Boolean);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Live Binance Market
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
                  {row.symbol}
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
    </div>
  );
};

export default MarketPage;
