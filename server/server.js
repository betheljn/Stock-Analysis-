import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import stockRoutes from './routes/stockRoutes.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity (change for production)
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/stocks', stockRoutes);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('trackStock', (symbol) => {
    console.log(`Tracking stock: ${symbol}`);

    setInterval(async () => {
      try {
        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apiKey=${process.env.POLYGON_API_KEY}`);
        const stockData = response.data.results[0];
        socket.emit('stockUpdate', stockData);
      } catch (error) {
        console.error('Error response from Polygon.io:', error?.response?.data || error.message);
        socket.emit('error', 'Error fetching stock data');
      }
    }, 5000); // Update every 5 seconds
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


