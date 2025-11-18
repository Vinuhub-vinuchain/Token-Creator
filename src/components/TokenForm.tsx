import { useState } from 'react';
import { ethers } from 'ethers';
import { TokenParams } from '../types';
import { useWallet } from '../hooks/useWallet';

interface TokenFormProps {
  tokenParams: TokenParams;
  setTokenParams: React.Dispatch<React.SetStateAction<TokenParams>>;
}

const TokenForm: React.FC<TokenFormProps> = ({ tokenParams, setTokenParams }) => {
  const { signer, fee } = useWallet();
  const [errors, setErrors] = useState<Partial<TokenParams>>({});
  const [deploying, setDeploying] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<TokenParams> = {};
    if (!tokenParams.name.trim()) newErrors.name = 'Token name is required.';
    if (!tokenParams.symbol.trim()) newErrors.symbol = 'Symbol is required.';
    if (!tokenParams.totalSupply || parseInt(tokenParams.totalSupply) <= 0) {
      newErrors.totalSupply = 'Supply must be greater than 0.';
    }
    if ((tokenParams.buyTaxRate > 0 || tokenParams.sellTaxRate > 0) && !ethers.utils.isAddress(tokenParams.devWallet)) {
      newErrors.devWallet = 'Valid dev wallet address required when taxes are set.';
    }
    if (tokenParams.maxTx && (parseInt(tokenParams.maxTx) < 0 || parseInt(tokenParams.maxTx) > 100)) {
      newErrors.maxTx = 'Max Tx must be between 0 and 100%.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeploy = async () => {
    if (!signer) {
      alert('Please connect wallet first.');
      return;
    }
    if (!validateForm()) {
      alert('Please fix form errors before deploying.');
      return;
    }

    setDeploying(true);
    try {
      const factoryAddress = '0xAAbe8531d02C2b1c1FCaa954E2E38D6bA1A6e0f7';
      const factoryABI = [
        'function createToken(string memory name, string memory symbol, uint256 initialSupply, uint8 decimals, uint256 buyTaxRate, uint256 sellTaxRate, uint256 burnRate, address devWallet, uint256 maxTxPercentage, bool renounce) external payable returns (address)',
        'function creationFee() external view returns (uint256)',
        'event TokenCreated(address indexed tokenAddress, address indexed creator)',
      ];
      const factory = new ethers.Contract(factoryAddress, factoryABI, signer);

      const supply = ethers.utils.parseUnits(tokenParams.totalSupply, tokenParams.decimals);
      const buyTaxRate = Math.round(tokenParams.buyTaxRate * 100);
      const sellTaxRate = Math.round(tokenParams.sellTaxRate * 100);
      const burnRate = Math.round(tokenParams.burnRate * 100);
      const devWallet = tokenParams.devWallet || '0x0000000000000000000000000000000000000000';
      const maxTxPercentage = parseInt(tokenParams.maxTx || '0');

      const tx = await factory.createToken(
        tokenParams.name,
        tokenParams.symbol.toUpperCase(),
        supply,
        tokenParams.decimals,
        buyTaxRate,
        sellTaxRate,
        burnRate,
        devWallet,
        maxTxPercentage,
        tokenParams.renounceOwnership,
        { value: fee, gasLimit: 3000000 }
      );

      alert(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);
      const receipt = await tx.wait();
      const event = receipt.events?.find((e: any) => e.event === 'TokenCreated');
      const tokenAddress = event?.args?.tokenAddress;

      if (!tokenAddress) {
        alert(`Deployment successful, but could not parse token address. Check tx: https://vinuexplorer.org/tx/${tx.hash}`);
        return;
      }

      alert(`Token deployed successfully at: ${tokenAddress}\nView on Explorer: https://vinuexplorer.org/address/${tokenAddress}\nTo enable trading, add liquidity manually on VinuSwap at https://vinuswap.com. After adding liquidity, find the pool address on VinuExplorer and call setPair(address) on your token contract to enable taxes if set.`);
      alert(`To verify your token on VinuExplorer:\n1. Go to https://vinuexplorer.org/address/${tokenAddress}\n2. Click "Verify & Publish"\n3. Use the CustomToken contract code from TokenVerificationGuide.md\n4. Set compiler to 0.8.20 and submit.`);
    } catch (error: any) {
      console.error('Deployment failed:', error);
      alert(`Deployment failed: ${error.message}`);
    } finally {
      setDeploying(false);
    }
  };

  const handleChange = (field: keyof TokenParams, value: string | number | boolean) => {
    setTokenParams((prev) => ({ ...prev, [field]: value }));
    validateForm();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Token Name</label>
        <input
          type="text"
          value={tokenParams.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., MyToken"
          maxLength={32}
          className="w-full p-2 border border-white rounded bg-black text-white"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">Symbol</label>
        <input
          type="text"
          value={tokenParams.symbol}
          onChange={(e) => handleChange('symbol', e.target.value)}
          placeholder="e.g., MTK"
          maxLength={6}
          className="w-full p-2 border border-white rounded bg-black text-white"
        />
        {errors.symbol && <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">Total Supply</label>
        <input
          type="number"
          value={tokenParams.totalSupply}
          onChange={(e) => handleChange('totalSupply', e.target.value)}
          placeholder="e.g., 1000000000"
          min="1"
          className="w-full p-2 border border-white rounded bg-black text-white"
        />
        {errors.totalSupply && <p className="text-red-500 text-xs mt-1">{errors.totalSupply}</p>}
      </div>
      <div>
        <label className="block text-sm mb-1">Decimals</label>
        <select
          value={tokenParams.decimals}
          onChange={(e) => handleChange('decimals', parseInt(e.target.value))}
          className="w-full p-2 border border-white rounded bg-black text-white"
        >
          <option value={6}>6</option>
          <option value={9}>9</option>
          <option value={12}>12</option>
          <option value={18}>18</option>
        </select>
      </div>
      <h3 className="text-xl font-bold mt-4">Advanced Options</h3>
      <div>
        <label className="block text-sm mb-1">Buy Tax (%)</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={tokenParams.buyTaxRate}
          onChange={(e) => handleChange('buyTaxRate', parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-400">{tokenParams.buyTaxRate}%</span>
        <p className="text-xs text-gray-400">Tax applied on token buys</p>
      </div>
      <div>
        <label className="block text-sm mb-1">Sell Tax (%)</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={tokenParams.sellTaxRate}
          onChange={(e) => handleChange('sellTaxRate', parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-400">{tokenParams.sellTaxRate}%</span>
        <p className="text-xs text-gray-400">Tax applied on token sells</p>
      </div>
      <div>
        <label className="block text-sm mb-1">Auto-Burn Rate (% per tx)</label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          value={tokenParams.burnRate}
          onChange={(e) => handleChange('burnRate', parseFloat(e.target.value))}
          className="w-full"
        />
        <span className="text-sm text-gray-400">{tokenParams.burnRate}%</span>
        <p className="text-xs text-gray-400">Percentage burned per transaction</p>
      </div>
      <div>
        <label className="block text-sm mb-1">Dev Wallet Address</label>
        <input
          type="text"
          value={tokenParams.devWallet}
          onChange={(e) => handleChange('devWallet', e.target.value)}
          placeholder="e.g., 0x1234..."
          className="w-full p-2 border border-white rounded bg-black text-white"
        />
        {errors.devWallet && <p className="text-red-500 text-xs mt-1">{errors.devWallet}</p>}
        <p className="text-xs text-gray-400">Address to receive taxes (required if taxes > 0%)</p>
      </div>
      <div>
        <label className="block text-sm mb-1">Max Transaction Amount (% of supply)</label>
        <input
          type="number"
          value={tokenParams.maxTx}
          onChange={(e) => handleChange('maxTx', e.target.value)}
          placeholder="e.g., 1"
          min="0"
          max="100"
          className="w-full p-2 border border-white rounded bg-black text-white"
        />
        {errors.maxTx && <p className="text-red-500 text-xs mt-1">{errors.maxTx}</p>}
        <p className="text-xs text-gray-400">Limits whale transactions to prevent dumps</p>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={tokenParams.renounceOwnership}
          onChange={(e) => handleChange('renounceOwnership', e.target.checked)}
          className="mr-2"
        />
        <label className="text-sm">Renounce Ownership After Deployment</label>
        <p className="text-xs text-gray-400 ml-2">Permanently renounces contract ownership for trust</p>
      </div>
      <button
        onClick={handleDeploy}
        disabled={deploying || !signer}
        className={`w-full p-3 rounded-lg border font-medium transition-all ${
          deploying || !signer
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-white text-black border-white hover:bg-black hover:text-white'
        }`}
      >
        {deploying ? 'Deploying...' : `Deploy Token (Fee: ${fee || '10000'} VC)`}
      </button>
    </div>
  );
};
