export interface AccessControlCondition {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: string[];
  returnValueTest: {
    comparator: string;
    value: string;
  };
}

export interface LitActionResponse {
  irysTxId: string;
  accessControlConditions: AccessControlCondition[];
  dataToEncryptHash: string;
}

export interface DecryptionParams {
  irysTxId: string;
  accessControlConditions?: AccessControlCondition[] | undefined;
  dataToEncryptHash: string;
}

export interface AccessControlCondition {
  contractAddress: string;
  standardContractType: string;
  chain: string;
  method: string;
  parameters: string[];
  returnValueTest: {
    comparator: string;
    value: string;
  };
}

export interface LitActionResponse {
  irysTxId: string;
  accessControlConditions: AccessControlCondition[];
  dataToEncryptHash: string;
}

export interface DecryptionParams {
  irysTxId: string;
  accessControlConditions?: AccessControlCondition[] | undefined;
  dataToEncryptHash: string;
}

export interface SessionSigs {
  [key: string]: any;
}

export interface LitActionParams {
  operation: 'store' | 'retrieve';
  data?: string | Uint8Array;
  irysTxId?: string;
  accessControlConditions: AccessControlCondition[];
  dataToEncryptHash?: string;
}