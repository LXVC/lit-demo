import * as LitJsSdk from '@lit-protocol/lit-node-client';
import { LitActionResource } from '@lit-protocol/auth-helpers';
import { LIT_ABILITY } from '@lit-protocol/constants';
import { createSiweMessageWithRecaps, generateAuthSig } from '@lit-protocol/auth-helpers';
import { ethers } from 'ethers';
import type { SessionSigs, AccessControlCondition } from '../types';

export const getSessionSigs = async (
  litNodeClient: LitJsSdk.LitNodeClient,
  ethersSigner: ethers.Signer,
  chain: string = 'ethereum',
  _accessControlConditions?: AccessControlCondition[]
): Promise<SessionSigs> => {
  try {
    // 生成 sessionSigs
    const sessionSigs = await litNodeClient.getSessionSigs({
      chain,
      expiration: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24小时有效期
      resourceAbilityRequests: [
        {
          resource: new LitActionResource('*'),
          ability: LIT_ABILITY.LitActionExecution,
        },
      ],
      authNeededCallback: async ({
        resourceAbilityRequests,
        expiration,
        uri,
      }) => {
        const toSign = await createSiweMessageWithRecaps({
          uri: uri!,
          expiration: expiration!,
          resources: resourceAbilityRequests!,
          walletAddress: await ethersSigner.getAddress(),
          nonce: await litNodeClient.getLatestBlockhash(),
          litNodeClient,
        });

        return await generateAuthSig({
          signer: ethersSigner,
          toSign,
        });
      },
    });

    return sessionSigs;
  } catch (error) {
    console.error('Error getting session signatures:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get session signatures: ${error.message}`);
    } else {
      throw new Error('Failed to get session signatures: Unknown error');
    }
  }
};

export const disconnectSession = async (litNodeClient: LitJsSdk.LitNodeClient): Promise<void> => {
  try {
    await litNodeClient.disconnect();
  } catch (error) {
    console.error('Error disconnecting session:', error);
  }
};