import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStockData } from '../feautures/stocks/stockSlice.js';
import { io } from 'socket.io-client';

const StockList = () => {
  const [symbol, setSymbol] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [portfolio, setPortfolio] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [socket, setSocket] = useState(null);

  const dispatch = useDispatch();
  const { stockData, loading, error } = useSelector((state) => state.stocks);
  
  const result = stockData?.results?.[0];

  /** 
   * Initialize the socket connection 
   * and clean up the socket on component unmount.
   */
  useEffect(() => {
    const newSocket = io('http://localhost:5000', { transports: ['websocket'] });
    setSocket(newSocket);

    newSocket.on('connect', () => console.log('Socket connected:', newSocket.id));
    
    newSocket.on('stockUpdate', (data) => {
      console.log('Updated stock price:', data);
      
      // Check if any of the price alerts are met
      alerts.forEach((alert) => {
        if (alert.symbol === data.symbol && data.close >= alert.targetPrice) {
          alert(`🚀 ${data.symbol} hit your target price of $${alert.targetPrice}!`);
        }
      });
    });

    return () => {
      console.log('Disconnecting socket...');
      newSocket.disconnect();
    };
  }, [alerts]);

  /** 
   * Load local storage for watchlist, portfolio, and alerts on app load.
   */
  useEffect(() => {
    const savedWatchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    const savedPortfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    const savedAlerts = JSON.parse(localStorage.getItem('alerts')) || [];

    setWatchlist(savedWatchlist);
    setPortfolio(savedPortfolio);
    setAlerts(savedAlerts);
  }, []);

  /** 
   * Add stock to the watchlist and save it to local storage.
   */
  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      const updatedWatchlist = [...watchlist, symbol];
      setWatchlist(updatedWatchlist);
      localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
    }
  };

  /** 
   * Remove stock from the watchlist and update local storage.
   */
  const removeFromWatchlist = (symbol) => {
    const updatedWatchlist = watchlist.filter((s) => s !== symbol);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(updatedWatchlist));
  };

  /** 
   * Buy stock and add it to the user's portfolio.
   */
  const buyStock = (symbol, quantity, price) => {
    const stock = { symbol, quantity, price };
    const updatedPortfolio = [...portfolio, stock];
    setPortfolio(updatedPortfolio);
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
  };

  // Calculate profit or loss
const calculateProfitLoss = (buyPrice, currentPrice, quantity) => {
    const profit = (currentPrice - buyPrice) * quantity;
    return profit.toFixed(2);
  };
  

  /** 
   * Add a price alert for a specific stock and save it to local storage.
   */
  const addAlert = (symbol, targetPrice) => {
    if (!symbol || !targetPrice) return;
    const newAlert = { symbol, targetPrice };
    setAlerts([...alerts, newAlert]);
    localStorage.setItem('alerts', JSON.stringify([...alerts, newAlert]));
  };

  /** 
   * Fetch stock data from the backend.
   */
  const handleFetchStock = () => {
    if (symbol.trim() !== '') {
      dispatch(fetchStockData(symbol));
      setSymbol(''); // Clear input after submission
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header Section */}
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">📈 Real-Time Stock Tracker</h1>

        {/* Stock Input Section */}
        <div className="flex justify-center items-center mb-8">
          <input 
            type="text" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value.toUpperCase())} 
            placeholder="Enter stock symbol (e.g., AAPL)" 
            className="w-64 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleFetchStock} 
            disabled={loading} 
            className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-all disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Track Stock'}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* Stock Info Section */}
        {result && (
          <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Stock Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <p><strong>Symbol:</strong> {stockData.ticker}</p>
              <p><strong>Open Price:</strong> ${result.o.toFixed(2)}</p>
              <p><strong>Close Price:</strong> ${result.c.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">My Watchlist</h2>
          <ul className="space-y-4">
            {watchlist.map((stock, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                <span className="text-lg font-medium">{stock}</span>
                <button onClick={() => removeFromWatchlist(stock)} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Portfolio Table */}
        <h2 className="text-2xl font-bold mt-8">My Portfolio</h2>
        <table className="w-full border-collapse border border-gray-200 mt-4">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Buy Price</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((stock, index) => (
              <tr key={index}>
                <td>{stock.symbol}</td>
                <td>{stock.quantity}</td>
                <td>${stock.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Alert Section */}
        <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
          <h2 className="text-xl font-bold mb-4">Set Price Alert</h2>
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Enter stock symbol" />
          <input type="number" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="Enter target price" />
          <button onClick={() => addAlert(symbol, alertPrice)}>Set Alert</button>
        </div>
      </div>
    </div>
  );
};

export default StockList;




