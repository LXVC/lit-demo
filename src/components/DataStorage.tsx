import React, { useState } from 'react';
import { ethers } from 'ethers';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { executeStoreAction } from '../utils/litActions';
import type { AccessControlCondition } from '../types';

interface DataStorageProps {
  litClient: LitJsSdk.LitNodeClient;
  ethersSigner: ethers.Signer;
  chain?: string;
}

const DataStorage: React.FC<DataStorageProps> = ({ 
  litClient, 
  ethersSigner, 
  chain = 'ethereum' 
}) => {
  const [data, setData] = useState('');
  const [isStoring, setIsStoring] = useState(false);
  const [result, setResult] = useState<{ 
    irysTxId: string; 
    decryptionParams: any 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const storeData = async () => {
    if (!data.trim()) {
      setError('请输入要存储的数据');
      return;
    }

    try {
      setIsStoring(true);
      setError(null);

      // 定义访问控制条件 - 只有当前账户可以解密
      const walletAddress = await ethersSigner.getAddress();
      const accessControlConditions: AccessControlCondition[] = [
        {
          contractAddress: '',
          standardContractType: '',
          chain,
          method: '',
          parameters: [':userAddress'],
          returnValueTest: {
            comparator: '=',
            value: walletAddress,
          },
        },
      ];

      const response = await executeStoreAction(
        litClient,
        data,
        accessControlConditions
      );
      
      setResult({
        irysTxId: response.irysTxId,
        decryptionParams: {
          accessControlConditions: response.accessControlConditions,
          dataToEncryptHash: response.dataToEncryptHash,
        },
      });
    } catch (err: any) {
      console.error('存储数据失败:', err);
      setError(err.message || '存储数据时发生未知错误');
    } finally {
      setIsStoring(false);
    }
  };

  return (
    <div style={{ 
      padding: '1.5rem', 
      border: '1px solid #e1e5e9', 
      borderRadius: '8px', 
      marginBottom: '1.5rem',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>加密并存储数据</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <textarea
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="输入要加密存储的数据"
          rows={4}
          style={{ 
            width: '100%', 
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        />
      </div>
      
      <button 
        onClick={storeData} 
        disabled={isStoring}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isStoring ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isStoring ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem'
        }}
      >
        {isStoring ? '加密存储中...' : '加密并存储'}
      </button>

      {error && (
        <div style={{ 
          color: '#ef4444', 
          marginTop: '1rem', 
          padding: '0.5rem',
          backgroundColor: '#fef2f2',
          borderRadius: '4px',
          fontSize: '0.875rem'
        }}>
          错误: {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>存储成功!</h3>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            <strong style={{ color: '#10b981' }}>Irys Transaction ID:</strong> 
            <span style={{ 
              fontFamily: 'monospace', 
              backgroundColor: '#f3f4f6',
              padding: '0.25rem',
              borderRadius: '2px',
              color: '#10b981'
            }}>
              {result.irysTxId}
            </span>
          </p>
          <div style={{ marginTop: '1rem' }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>
              解密参数 (请妥善保存):
            </strong>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              overflow: 'auto',
              fontSize: '0.75rem',
              border: '1px solid #e9ecef',
              textAlign: 'left',
              borderRadius: '4px',
              color: 'black'
            }}>
              {JSON.stringify(result.decryptionParams, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataStorage;