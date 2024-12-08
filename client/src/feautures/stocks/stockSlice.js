import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchStockData = createAsyncThunk(
  'stocks/fetchStockData',
  async (symbol, { rejectWithValue }) => {
    try {
      const response = await fetch(`http://localhost:5000/api/stocks/${symbol}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      return rejectWithValue('Failed to load stock data.');
    }
  }
);

const stockSlice = createSlice({
  name: 'stocks',
  initialState: {
    stockData: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStockData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStockData.fulfilled, (state, action) => {
        state.loading = false;
        state.stockData = action.payload;
      })
      .addCase(fetchStockData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default stockSlice.reducer;
