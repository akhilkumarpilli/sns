"use client";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { getSnsProgram, useAnchorProvider } from "@/utils/sns-exports";
import { BN } from "bn.js";
import { web3 } from "@coral-xyz/anchor";
import { useTransactionToast } from "./useTxnToast";

interface InitializeConfigArgs {
  admin: PublicKey;
  treasury: PublicKey;
  pricePerChar: number;
}

interface RegisterNameArgs {
  name: string;
  metadata: string;
}

interface UpdateMetadataArgs {
  newMetadata: string;
}

interface SetReverseRecordArgs {
  name: string;
}

export function useSnsProgram() {
  const { connection } = useConnection();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = new PublicKey(
    "GMs44YSfLymVVmvoizi9HXUFrgsDbYNCHWkLW7mG6QJ9"
  );
  const program = useMemo(
    () => getSnsProgram(provider, programId),
    [provider, programId]
  );

  // Get all name records
  const nameRecords = useQuery({
    queryKey: ["sns", "nameRecords", "all"],
    queryFn: () => program.account.nameRecord.all(),
  });

  // Get all reverse records
  const reverseRecords = useQuery({
    queryKey: ["sns", "reverseRecords", "all"],
    queryFn: () => program.account.reverseRecord.all(),
  });

  // Get config account
  const config = useQuery({
    queryKey: ["sns", "config"],
    queryFn: async () => {
      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        programId
      );
      return program.account.config.fetch(configPda);
    },
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account"],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // Initialize config (admin only)
  const initializeConfig = useMutation<string, Error, InitializeConfigArgs>({
    mutationKey: ["sns", "initializeConfig"],
    mutationFn: async ({ admin, treasury, pricePerChar }) => {
      return program.methods
        .initializeConfig(admin, treasury, new BN(pricePerChar))
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      config.refetch();
    },
    onError: (error) => {
      toast.error(`Error initializing config: ${error.message}`);
    },
  });

  // Register a new name
  const registerName = useMutation<string, Error, RegisterNameArgs>({
    mutationKey: ["sns", "registerName"],
    mutationFn: async ({ name, metadata }) => {
      return program.methods.registerName(name, metadata).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      nameRecords.refetch();
      reverseRecords.refetch();
    },
    onError: (error) => {
      toast.error(`Error registering name: ${error.message}`);
    },
  });

  // Withdraw fees (admin only)
  const withdrawFees = useMutation<string, Error, void>({
    mutationKey: ["sns", "withdrawFees"],
    mutationFn: async () => {
      return program.methods.withdrawFees().rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      config.refetch();
    },
    onError: (error) => {
      toast.error(`Error withdrawing fees: ${error.message}`);
    },
  });

  return {
    program,
    programId,
    nameRecords,
    reverseRecords,
    config,
    getProgramAccount,
    initializeConfig,
    registerName,
    withdrawFees,
  };
}

export function useSnsNameRecord({ name }: { name: string }) {
  const transactionToast = useTransactionToast();
  const { program, nameRecords } = useSnsProgram();
  const { publicKey } = useWallet();

  // Get specific name record
  const nameRecord = useQuery({
    queryKey: ["sns", "nameRecord", name],
    queryFn: async () => {
      const [nameRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("name"), Buffer.from(name)],
        program.programId
      );
      return program.account.nameRecord.fetch(nameRecordPda);
    },
    enabled: !!name,
  });

  // Renew name - Anchor auto-derives accounts from IDL
  const renewName = useMutation<string, Error, void>({
    mutationKey: ["sns", "renewName", name],
    mutationFn: async () => {
      if (!publicKey) throw new Error("Wallet not connected");

      const [nameRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("name"), Buffer.from(name)],
        program.programId
      );

      const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("config")],
        program.programId
      );

      // Get config to find treasury address
      const configAccount = await program.account.config.fetch(configPda);

      return program.methods
        .renewName()
        .accounts({
          user: publicKey,
          nameRecord: nameRecordPda,
          config: configPda,
          treasury: configAccount.treasury,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      nameRecord.refetch();
      nameRecords.refetch();
    },
    onError: (error) => {
      toast.error(`Error renewing name: ${error.message}`);
    },
  });

  // Update metadata - Anchor auto-derives accounts from IDL
  const updateMetadata = useMutation<string, Error, UpdateMetadataArgs>({
    mutationKey: ["sns", "updateMetadata", name],
    mutationFn: async ({ newMetadata }) => {
      if (!publicKey) throw new Error("Wallet not connected");

      const [nameRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("name"), Buffer.from(name)],
        program.programId
      );

      return program.methods
        .updateMetadata(newMetadata)
        .accounts({
          user: publicKey,
          nameRecord: nameRecordPda,
        })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      console.log("Sing", signature);
      nameRecord.refetch();
      nameRecords.refetch();
    },
    onError: (error) => {
      toast.error(`Error updating metadata: ${error.message}`);
    },
  });

  return {
    nameRecord,
    renewName,
    updateMetadata,
  };
}

export function useSnsReverseRecord({
  userAddress,
}: {
  userAddress: PublicKey;
}) {
  const transactionToast = useTransactionToast();
  const { program, reverseRecords } = useSnsProgram();

  // Get reverse record for user
  const reverseRecord = useQuery({
    queryKey: ["sns", "reverseRecord", userAddress.toString()],
    queryFn: async () => {
      const [reverseRecordPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("reverse"), userAddress.toBuffer()],
        program.programId
      );
      return program.account.reverseRecord.fetch(reverseRecordPda);
    },
    enabled: !!userAddress,
  });

  // Set reverse record - Anchor auto-derives accounts from IDL
  const setReverseRecord = useMutation<string, Error, SetReverseRecordArgs>({
    mutationKey: ["sns", "setReverseRecord", userAddress.toString()],
    mutationFn: async ({ name }) => {
      return program.methods.setReverseRecord(name).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      reverseRecord.refetch();
      reverseRecords.refetch();
    },
    onError: (error) => {
      toast.error(`Error setting reverse record: ${error.message}`);
    },
  });

  return {
    reverseRecord,
    setReverseRecord,
  };
}

// Utility hook for name resolution
export function useNameResolution() {
  const { nameRecords } = useSnsProgram();

  const resolveNameToAddress = (name: string): PublicKey | null => {
    if (!nameRecords.data) return null;

    const record = nameRecords.data.find(
      (record) => record.account.name === name
    );
    return record ? record.account.owner : null;
  };

  const resolveAddressToName = (address: PublicKey): string | null => {
    if (!nameRecords.data) return null;

    const record = nameRecords.data.find((record) =>
      record.account.owner.equals(address)
    );
    return record ? record.account.name : null;
  };

  return {
    resolveNameToAddress,
    resolveAddressToName,
  };
}

// Additional utility hook for name expiration checks
export function useNameExpiration() {
  const { nameRecords } = useSnsProgram();

  const isNameExpired = (name: string): boolean => {
    if (!nameRecords.data) return false;

    const record = nameRecords.data.find(
      (record) => record.account.name === name
    );

    if (!record) return false;

    const now = Date.now() / 1000; // Convert to seconds
    return record.account.expiresAt.toNumber() < now;
  };

  const getExpirationDate = (name: string): Date | null => {
    if (!nameRecords.data) return null;

    const record = nameRecords.data.find(
      (record) => record.account.name === name
    );

    if (!record) return null;

    return new Date(record.account.expiresAt.toNumber() * 1000);
  };

  const getDaysUntilExpiration = (name: string): number | null => {
    const expirationDate = getExpirationDate(name);
    if (!expirationDate) return null;

    const now = new Date();
    const diffInMs = expirationDate.getTime() - now.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  };

  return {
    isNameExpired,
    getExpirationDate,
    getDaysUntilExpiration,
  };
}
