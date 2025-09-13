import { useState } from 'react'
import _reactLogo from './assets/react.svg'
import _viteLogo from '/vite.svg'
import './App.css'

import WalletConnector from './components/WalletConnector';
import DataStorage from './components/DataStorage';
import DataRetrieval from './components/DataRetrieval';
import { useLitClient } from './hooks/useLitClient';
import { ethers } from 'ethers';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [ethersSigner, setEthersSigner] = useState<ethers.Signer | null>(null);
  const { litClient, isReady } = useLitClient();
  const chain = 'ethereum';

  if (!isReady) {
    return <div>等待初始化 Lit 客户端...</div>;
  }

  return (
    <div className="App">
      <h1>Lit Protocol + Irys 集成示例</h1>

      <WalletConnector onAccountChange={setAccount} onEthersSignerChange={setEthersSigner} />

      {litClient && account && ethersSigner && (
        <>
          <DataStorage
            litClient={litClient}
            ethersSigner={ethersSigner}
            chain={chain}
          />
          <DataRetrieval
            litClient={litClient}
            ethersSigner={ethersSigner}
            chain={chain}
          />
        </>
      )}
    </div>
  );
}

export default App
