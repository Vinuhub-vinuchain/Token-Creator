import { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import TokenForm from './components/TokenForm';
import Preview from './components/Preview';
import { TokenParams } from './types';

const App: React.FC = () => {
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
      <header className="fixed top-0 w-full h-16 bg-black border-b border-white flex justify-between items-center px-4">
        <img
          src="https://photos.pinksale.finance/file/pinksale-logo-upload/1759847695513-f915ce15471ce09f03d8fbf68bc0616f.png"
          alt="VinuToken Creator Logo"
          className="h-10"
        />
        <WalletConnect />
      </header>
      <main className="max-w-2xl mx-auto mt-20 p-4 bg-black border border-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Create Your Token on VinuChain</h2>
        <TokenForm tokenParams={tokenParams} setTokenParams={setTokenParams} />
        <Preview tokenParams={tokenParams} />
      </main>
      <footer className="text-center py-4 border-t border-white bg-black">
        <a href="https://vinuchain.org" target="_blank" className="text-white mx-2 hover:underline">VinuChain Docs</a> |
        <a href="https://vinuexplorer.org" target="_blank" className="text-white mx-2 hover:underline">Explorer</a> |
        <a href="#" target="_blank" className="text-white mx-2 hover:underline">Support</a>
      </footer>
    </div>
  );
};

export default App;