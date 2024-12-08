import axios from 'axios';

export const getStockData = async (req, res) => {
  const { symbol } = req.params;
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is missing' });
  }

  try {
    const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${apiKey}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error response from Polygon.io:', error?.response?.data || error.message);
    res.status(500).json({ 
      error: 'Error fetching stock data', 
      details: error?.response?.data || 'Unknown error occurred' 
    });
  }
};


