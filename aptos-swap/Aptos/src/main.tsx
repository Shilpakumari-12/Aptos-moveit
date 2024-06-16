import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';
import App from './App'; 
import { PetraWallet } from '@aptos-labs/wallet-adapter-ant-design';
import { WalletProvider } from '@aptos-labs/wallet-adapter-react';

// Initialize wallets
const wallets = [new PetraWallet()];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WalletProvider wallets={wallets} autoConnect={true}>
      <App />
    </WalletProvider>
  </React.StrictMode>
);
