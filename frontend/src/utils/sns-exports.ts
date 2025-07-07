// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import SnsIDL from './sns.json';
import type { Sns } from '../types/sns'
import { AnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';

// Re-export the generated IDL and type
export { Sns, SnsIDL }

// The programId is imported from the program IDL.
export const COUNTER_PROGRAM_ID = new PublicKey(SnsIDL.address)

// This is a helper function to get the Counter Anchor program.
export function getSnsProgram(provider: AnchorProvider, address?: PublicKey): Program<Sns> {
  return new Program({ ...SnsIDL, address: address ? address.toBase58() : SnsIDL.address } as Sns, provider)
}

// This is a helper function to get the program ID for the Counter program depending on the cluster.
export function getSnsProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Counter program on devnet and testnet.
      return new PublicKey('6wfx3ZD75ePHe5ioWuwqJNbJmyAioYtT19QFHHGHbZxB')
    case 'mainnet-beta':
    default:
      return COUNTER_PROGRAM_ID
  }
}

export function useAnchorProvider() {
  const { connection } = useConnection()
  const wallet = useWallet()

  return new AnchorProvider(connection, wallet as AnchorWallet, { commitment: 'confirmed' })
}

