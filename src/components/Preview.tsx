import { TokenParams } from '../types';

interface PreviewProps {
  tokenParams: TokenParams;
}

const Preview: React.FC<PreviewProps> = ({ tokenParams }) => {
  return (
    <div className="mt-4 p-4 border border-white rounded-lg bg-black shadow">
      <p>Token: {tokenParams.name || 'MyToken'} ({tokenParams.symbol || 'MTK'})</p>
      <p>Supply: {tokenParams.totalSupply ? Number(tokenParams.totalSupply).toLocaleString() : '1,000,000,000'}</p>
      <p>Decimals: {tokenParams.decimals}</p>
      <p>Buy Tax: {tokenParams.buyTaxRate}%</p>
      <p>Sell Tax: {tokenParams.sellTaxRate}%</p>
      <p>Burn Rate: {tokenParams.burnRate}%</p>
      <p>Dev Wallet: {tokenParams.devWallet || 'Not set'}</p>
      <p>Max Tx: {tokenParams.maxTx ? `${tokenParams.maxTx}%` : 'None'}</p>
      <p>Renounce Ownership: {tokenParams.renounceOwnership ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default Preview;