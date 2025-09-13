import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletConnectorProps {
  onAccountChange: (account: string | null) => void;
  onEthersSignerChange: (signer: ethers.Signer | null) => void;
}

const WalletConnector: React.FC<WalletConnectorProps> = ({ onAccountChange, onEthersSignerChange }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          onAccountChange(accounts[0]);
          onEthersSignerChange(new ethers.providers.Web3Provider(window.ethereum).getSigner());
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setIsConnecting(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        onAccountChange(accounts[0]);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '5px', marginBottom: '1rem' }}>
      <h2>钱包连接</h2>
      {account ? (
        <p>已连接账户: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
      ) : (
        <button onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? '连接中...' : '连接钱包'}
        </button>
      )}
    </div>
  );
};

export default WalletConnector;