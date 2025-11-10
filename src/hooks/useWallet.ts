import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useWallet = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [balance, setBalance] = useState<string>('0 WVC');
  const [fee, setFee] = useState<string>('10000');

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask or Vinufolio wallet from https://metamask.io.');
    }

    const web3Provider = new ethers.providers.Web3Provider(window.ethereum, 207);
    await web3Provider.send('eth_requestAccounts', []);

    const network = await web3Provider.getNetwork();
    if (network.chainId !== 207) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xCF' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xCF',
              chainName: 'VinuChain',
              rpcUrls: ['https://rpc.vinuchain.org', 'https://vinuchain-rpc.com'],
              nativeCurrency: { name: 'VinuChain', symbol: 'VC', decimals: 18 },
              blockExplorerUrls: ['https://vinuexplorer.org'],
            }],
          });
        } else if (switchError.code === 4001) {
          throw new Error('User rejected network switch to VinuChain.');
        } else {
          throw new Error(`Network switch error: ${switchError.message}`);
        }
      }
    }

    const newSigner = web3Provider.getSigner();
    const address = await newSigner.getAddress();
    setProvider(web3Provider);
    setSigner(newSigner);

    try {
      const wvcContract = new ethers.Contract(
        '0xEd8c5530a0A086a12f57275728128a60DFf04230',
        ['function balanceOf(address) view returns (uint256)'],
        web3Provider
      );
      const balanceWei = await wvcContract.balanceOf(address);
      setBalance(`${ethers.utils.formatEther(balanceWei)} WVC`);
    } catch (error) {
      console.warn('Failed to fetch WVC balance:', error);
      setBalance('Error fetching WVC balance');
    }
  };

  const fetchCreationFee = async () => {
    if (!provider) return;
    try {
      const factoryAddress = '0x451B1Ac95D2E2E8d920C7a54204a7f3F9290331d';
      const factoryABI = ['function creationFee() external view returns (uint256)'];
      const factory = new ethers.Contract(factoryAddress, factoryABI, provider);
      const feeWei = await factory.creationFee();
      setFee(ethers.utils.formatEther(feeWei));
    } catch (error) {
      console.error('Failed to fetch creation fee:', error);
      setFee('10000');
    }
  };

  return { provider, signer, balance, connectWallet, fetchCreationFee, fee };
};
