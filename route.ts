
const SP500 = [
  "AAPL","MSFT","NVDA","AMZN","META",
  "GOOGL","TSLA","AMD","NFLX","JPM"
]

async function getPreviousDay(symbol: string) {
  const apiKey = process.env.POLYGON_API_KEY

  const url =
    `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apiKey=${apiKey}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.results || !data.results[0]) return null

  return {
    high: data.results[0].h,
    low: data.results[0].l,
  }
}

async function getTodayOpen(symbol: string) {
  const apiKey = process.env.POLYGON_API_KEY

  const url =
    `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${apiKey}`

  const res = await fetch(url)
  const data = await res.json()

  if (!data.ticker) return null

  return {
    open: data.ticker.day.o,
  }
}

export async function GET() {
  const results = []

  for (const symbol of SP500) {
    try {
      const prev = await getPreviousDay(symbol)
      const today = await getTodayOpen(symbol)

      if (!prev || !today) continue

      if (today.open > prev.high) {
        results.push({
          symbol,
          type: "GAP_UP",
          open: today.open,
          previousHigh: prev.high,
        })
      }

      if (today.open < prev.low) {
        results.push({
          symbol,
          type: "GAP_DOWN",
          open: today.open,
          previousLow: prev.low,
        })
      }
    } catch (err) {
      console.log("Error:", symbol)
    }
  }

  return Response.json(results)
}
