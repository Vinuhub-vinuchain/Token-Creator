export interface TokenParams {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
  buyTaxRate: number;
  sellTaxRate: number;
  burnRate: number;
  devWallet: string;
  maxTx: string;
  renounceOwnership: boolean;
}
