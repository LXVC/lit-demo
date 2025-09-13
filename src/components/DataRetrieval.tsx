import React, { useState } from 'react';
import { ethers } from 'ethers';
import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { executeRetrieveAction } from '../utils/litActions';
import type { DecryptionParams } from '../types';

interface DataRetrievalProps {
  litClient: LitJsSdk.LitNodeClient;
  ethersSigner: ethers.Signer;
  chain?: string;
}

const DataRetrieval: React.FC<DataRetrievalProps> = ({ 
  litClient, 
  ethersSigner, 
  chain = 'ethereum' 
}) => {
  const [irysTxId, setIrysTxId] = useState('');
  const [dataToEncryptHash] = useState('');
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [decryptedData, setDecryptedData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const retrieveData = async () => {
    if (!irysTxId.trim()) {
      setError('请输入 Irys Transaction ID');
      return;
    }

    // if (!accessControlConditions.trim()) {
    //   setError('请输入访问控制条件');
    //   return;
    // }

    try {
      setIsRetrieving(true);
      setError(null);

      // 解析访问控制条件
      // let acc: AccessControlCondition[];
      // try {
      //   acc = JSON.parse(accessControlConditions);
      // } catch (parseError) {
      //   setError('访问控制条件格式错误，必须是有效的 JSON');
      //   return;
      // }

      const decryptionParams: DecryptionParams = {
        irysTxId,
        // accessControlConditions: acc,
        dataToEncryptHash
      };

      const data = await executeRetrieveAction(
        litClient,
        ethersSigner,
        decryptionParams,
        chain
      );

      setDecryptedData(data);
    } catch (err: any) {
      console.error('检索数据失败:', err);
      setError(err.message || '检索数据时发生未知错误');
    } finally {
      setIsRetrieving(false);
    }
  };

  const clearResults = () => {
    setDecryptedData(null);
    setError(null);
  };

  return (
    <div style={{ 
      padding: '1.5rem', 
      border: '1px solid #e1e5e9', 
      borderRadius: '8px',
      backgroundColor: '#fff'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>解密并读取数据</h2>
      
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={irysTxId}
          onChange={(e) => {
            setIrysTxId(e.target.value);
            clearResults();
          }}
          placeholder="输入 Irys Transaction ID"
          style={{ 
            width: '100%', 
            padding: '0.5rem',
            marginBottom: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        />
        
        {/* <textarea
          value={accessControlConditions}
          onChange={(e) => {
            setAccessControlConditions(e.target.value);
            clearResults();
          }}
          placeholder='输入访问控制条件 (JSON格式，例如: [{"contractAddress":"","standardContractType":"","chain":"ethereum","method":"","parameters":[":userAddress"],"returnValueTest":{"comparator":"=","value":"0xYourAddress"}}])'
          rows={4}
          style={{ 
            width: '100%', 
            padding: '0.5rem',
            marginBottom: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        /> */}
        
        {/* <input
          type="text"
          value={dataToEncryptHash}
          onChange={(e) => {
            setDataToEncryptHash(e.target.value);
            clearResults();
          }}
          placeholder="输入 Data to Encrypt Hash (可选)"
          style={{ 
            width: '100%', 
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '0.875rem'
          }}
        /> */}
      </div>
      
      <button 
        onClick={retrieveData} 
        disabled={isRetrieving}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isRetrieving ? '#9ca3af' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isRetrieving ? 'not-allowed' : 'pointer',
          fontSize: '0.875rem',
          marginRight: '0.5rem'
        }}
      >
        {isRetrieving ? '解密中...' : '解密并读取'}
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

      {decryptedData && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ color: '#10b981', marginBottom: '0.5rem' }}>解密成功!</h3>
          <div style={{ 
            background: '#f0fdf4', 
            padding: '1rem', 
            borderRadius: '4px',
            border: '1px solid #bbf7d0'
          }}>
            <strong style={{ display: 'block', marginBottom: '0.5rem' }}>数据内容:</strong>
            <div style={{ 
              fontFamily: 'monospace', 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              fontSize: '0.875rem',
              color: '#10b981'
            }}>
              {decryptedData}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataRetrieval;