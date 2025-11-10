# VinuToken Creator

A React-based application for creating tokens on VinuChain using the TokenFactory contract.

## Features
- Connect to VinuChain (chain ID 207) via MetaMask or Vinufolio.
- Create ERC-20 tokens with customizable parameters:
  - Name, symbol, total supply, decimals.
  - Buy/sell taxes (up to 10%), auto-burn rate (up to 5%).
  - Dev wallet for tax collection, max transaction limit.
  - Option to renounce ownership.
- Deploy tokens to the TokenFactory contract at `0x451B1Ac95D2E2E8d920C7a54204a7f3F9290331d`.
- Manual liquidity addition instructions for VinuSwap.
