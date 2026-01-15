import WalletConnect from './components/WalletConnect.tsx';
import TokenForm from './components/TokenForm.tsx';
import Preview from './components/Preview.tsx';
import { useState } from 'react';
import { TokenParams } from './types.ts';

function App() {
  const [tokenParams, setTokenParams] = useState<TokenParams>({
    name: '',
    symbol: '',
    totalSupply: '',
    decimals: 18,
    buyTaxRate: 0,
    sellTaxRate: 0,
    burnRate: 0,
    devWallet: '',
    maxTx: '',
    renounceOwnership: false,
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 w-full h-16 bg-black border-b border-white flex justify-between items-center px-5 z-50">
        <div className="logo">
          <img
            src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png"
            alt="VinuToken Creator Logo"
            className="h-10"
          />
        </div>
        <div className="wallet-section">
          <WalletConnect />
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-24 px-4 pb-8">
        <div className="container bg-black border border-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Create Your Token on VinuChain</h2>

          <TokenForm tokenParams={tokenParams} setTokenParams={setTokenParams} />
          <Preview tokenParams={tokenParams} />
        </div>
      </main>

      <footer className="text-center py-5 border-t border-white bg-black text-sm">
        <a href="https://vinuchain.org" target="_blank" className="mx-3 hover:underline">VinuChain Docs</a> |
        <a href="https://vinuexplorer.org" target="_blank" className="mx-3 hover:underline">Explorer</a> |
        <a href="#" target="_blank" className="mx-3 hover:underline">Support</a>
      </footer>
    </div>
  );
}

export default App;
