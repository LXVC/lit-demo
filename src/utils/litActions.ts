import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { encryptString, decryptToString } from "@lit-protocol/encryption";
import { ethers } from 'ethers';
import type {
  LitActionResponse,
  DecryptionParams,
  AccessControlCondition,
  SessionSigs
} from '../types';
import { getSessionSigs } from './litSession';
import { WebUploader } from "@irys/web-upload";
import { WebEthereum } from "@irys/web-upload-ethereum";

const getIrysUploader = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const irysUploader = await WebUploader(WebEthereum).withProvider(provider);

  return irysUploader;
};

async function retrieveFromIrys(id: string): Promise<[string, string, object[]]> {
  const gatewayAddress = "https://gateway.irys.xyz/";
  const url = `${gatewayAddress}${id}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to retrieve data for ID: ${id}`);
    const data = await response.json();

    return [data.cipherText, data.dataToEncryptHash, data.accessControlConditions];
  } catch (error) {
    console.error("Error retrieving data: ", error);
    return ["", "", []];
  }
}


async function decryptData(
  ciphertext: string,
  dataToEncryptHash: string,
  accessControlConditions: object[],
  litNodeClient: LitJsSdk.LitNodeClient,
  sessionSigs: SessionSigs
): Promise<string> {

  const decryptedString = await decryptToString(
    {
      accessControlConditions,
      chain: "ethereum",
      ciphertext,
      dataToEncryptHash,
      sessionSigs,
    },
    litNodeClient
  );

  return decryptedString;
}

const encryptData = async (dataToEncrypt: string, litNodeClient: LitJsSdk.LitNodeClient, accessControlConditions: AccessControlCondition[]) => {
  try {
    const { ciphertext, dataToEncryptHash } = await encryptString(
      {
        accessControlConditions,
        dataToEncrypt: dataToEncrypt,
      },
      litNodeClient,
    );

    console.log("Encrypted data:", ciphertext);
    console.log("Data hash:", dataToEncryptHash);

    return { ciphertext, dataToEncryptHash };
  } catch (error) {
    console.error("Error encrypting data:", error);
  }
};

export const uploadToIrys = async (cipherText: string, dataToEncryptHash: string, accessControlConditions: AccessControlCondition[]): Promise<string> => {
  const irysUploader = await getIrysUploader();

  const dataToUpload = {
    cipherText: cipherText,
    dataToEncryptHash: dataToEncryptHash,
    accessControlConditions: accessControlConditions,
  };

  try {
    const tags = [{ name: "Content-Type", value: "application/json" }];
    const receipt = await irysUploader.upload(JSON.stringify(dataToUpload), { tags });
    console.log("Upload receipt:", receipt);
    
    
    return receipt?.id ? receipt.id : "";
  } catch (error) {
    console.error("Error uploading data: ", error);
    throw error;
  }
};


// 执行存储操作
export const executeStoreAction = async (
  litNodeClient: LitJsSdk.LitNodeClient,
  data: string,
  accessControlConditions: AccessControlCondition[],
): Promise<LitActionResponse> => {
  try {
    const { ciphertext, dataToEncryptHash } = await encryptData(data, litNodeClient, accessControlConditions) || {};
    const id = await uploadToIrys(ciphertext!, dataToEncryptHash!, accessControlConditions);

    return {
      irysTxId: id,
      accessControlConditions: accessControlConditions,
      dataToEncryptHash: dataToEncryptHash!,
    }
  } catch (error) {
    console.error('Error executing store action:', error);
    throw new Error(`Store action failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
};

// 执行检索操作
export const executeRetrieveAction = async (
  litNodeClient: LitJsSdk.LitNodeClient,
  ethersSigner: ethers.Signer,
  decryptionParams: DecryptionParams,
  chain: string = 'ethereum'
): Promise<string> => {
  try {
    // 获取会话签名
    const sessionSigs = await getSessionSigs(litNodeClient, ethersSigner, chain, decryptionParams.accessControlConditions);

    const result = await retrieveFromIrys(decryptionParams.irysTxId);
    
    const text = await decryptData(result[0], result[1], result[2], litNodeClient, sessionSigs);
    
    return text.toString();
  } catch (error) {
    console.error('Error executing retrieve action:', error);
    throw new Error(`Retrieve action failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  }
};
