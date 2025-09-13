import { useState, useEffect } from 'react';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { LIT_NETWORK } from '@lit-protocol/constants';

export const useLitClient = () => {
  const [litClient, setLitClient] = useState<LitJsSdk.LitNodeClient | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeLitClient = async () => {
      try {
        const client = new LitJsSdk.LitNodeClient({
          alertWhenUnauthorized: false,
          litNetwork: LIT_NETWORK.DatilDev,
          debug: false,
        });
        
        await client.connect();
        setLitClient(client);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize Lit client:', error);
      }
    };

    initializeLitClient();
  }, []);

  return { litClient, isReady };
};