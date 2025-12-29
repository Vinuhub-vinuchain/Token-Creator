import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';

const WalletConnect: React.FC = () => {
  const { provider, signer, balance, connectWallet, fetchCreationFee, fee } = useWallet();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCreationFee();
  }, [provider]);

  const handleConnect = async () => {
    setError('');
    try {
      await connectWallet();
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet. Check console for details.');
      console.error('Wallet connection failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleConnect}
        disabled={!!signer}
        className={`px-4 py-2 rounded-lg border font-medium transition-all ${
          signer
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-white text-black border-white hover:bg-black hover:text-white'
        }`}
      >
        {signer ? `Connected: ${(signer as any)._address.slice(0, 6)}...${(signer as any)._address.slice(-4)}` : 'Connect Wallet'}
      </button>
      <span className="text-sm text-gray-400">Balance: {balance}</span>
      {error && <span className="text-red-500 text-sm">{error}</span>}
      {fee && <span className="text-sm text-gray-400">Fee: {fee} VC</span>}
    </div>
  );
};

export default WalletConnect;
