import { Provider } from 'react-redux';
import { store } from './app/store';
import StockList from './components/StockList';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <h1>Stock Analysis App</h1>
        <StockList />
      </div>
    </Provider>
  );
}

export default App;

