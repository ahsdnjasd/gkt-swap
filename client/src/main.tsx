import React from 'react';
import ReactDOM from 'react-dom/client';
import { SwapCard } from './components/SwapCard';
import './index.css';

const App = () => {
  return (
    <div className="container px-4">
      <SwapCard />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
