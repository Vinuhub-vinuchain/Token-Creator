import { TokenParams } from '../types';

interface PreviewProps {
  tokenParams: TokenParams;
}

const Preview: React.FC<PreviewProps> = ({ tokenParams }) => {
  return (
    <div className="preview mt-6">
      <p>Token: <span>{tokenParams.name || 'MyToken'}</span> (<span>{tokenParams.symbol || 'MTK'}</span>)</p>
      <p>Supply: <span>{tokenParams.totalSupply ? Number(tokenParams.totalSupply).toLocaleString() : '1,000,000,000'}</span></p>
      <p>Decimals: <span>{tokenParams.decimals}</span></p>
      <p>Buy Tax: <span>{tokenParams.buyTaxRate}%</span></p>
      <p>Sell Tax: <span>{tokenParams.sellTaxRate}%</span></p>
      <p>Burn Rate: <span>{tokenParams.burnRate}%</span></p>
      <p>Dev Wallet: <span>{tokenParams.devWallet || 'Not set'}</span></p>
      <p>Max Tx: <span>{tokenParams.maxTx ? `${tokenParams.maxTx}%` : 'None'}</span></p>
      <p>Renounce Ownership: <span>{tokenParams.renounceOwnership ? 'Yes' : 'No'}</span></p>
    </div>
  );
};

export default Preview;
