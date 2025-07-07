"use client";

import React, { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import {
  Globe,
  Star,
  Edit3,
  Calendar,
  AlertCircle,
  RefreshCw,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { useSnsProgram, useSnsNameRecord, useSnsReverseRecord } from "@/hooks/snsDataAccess";

interface NameCardProps {
  name: string;
  owner: string;
  metadata: string;
  expiresAt: number;
  isPrimary: boolean;
  onRenew: (name: string) => void;
  onSetPrimary: (name: string) => void;
  isRenewing?: boolean;
  isUpdatingMetadata?: boolean;
  isSettingPrimary?: boolean;
}

const isExpired = (expiresAt: number): boolean => {
  return Date.now() > expiresAt * 1000;
};

const isExpiringSoon = (expiresAt: number): boolean => {
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  return (
    Date.now() > expiresAt * 1000 - thirtyDaysInMs && !isExpired(expiresAt)
  );
};

const Manage: React.FC = () => {
  const { publicKey } = useWallet();
  const { nameRecords, reverseRecords } = useSnsProgram();
  const [renewingNames, setRenewingNames] = useState<Set<string>>(new Set());
  const [updatingMetadata, setUpdatingMetadata] = useState<Set<string>>(new Set());
  const [settingPrimary, setSettingPrimary] = useState<Set<string>>(new Set());

  // Get user's names
  const userNames = useMemo(() => {
    if (!publicKey || !nameRecords.data) return [];

    return nameRecords.data
      .filter((record) => record.account.owner.equals(publicKey))
      .map((record) => ({
        name: record.account.name,
        owner: record.account.owner.toString(),
        metadata: record.account.metadata,
        expiresAt: record.account.expiresAt.toNumber(),
        isPrimary: false, // We'll determine this below
      }));
  }, [publicKey, nameRecords.data]);

  // Get user's primary name (reverse record)
  const primaryName = useMemo(() => {
    if (!publicKey || !reverseRecords.data) return null;

    const userReverseRecord = reverseRecords.data.find((record) => {
      // Check if this reverse record belongs to the current user
      // The reverse record PDA is derived from the user's public key
      const [reversePda] = PublicKey.findProgramAddressSync(
        [Buffer.from('reverse'), publicKey.toBuffer()],
        new PublicKey('6wfx3ZD75ePHe5ioWuwqJNbJmyAioYtT19QFHHGHbZxB') // Your program ID
      );
      return record.publicKey.equals(reversePda);
    });
    return userReverseRecord?.account.name || null;
  }, [publicKey, reverseRecords.data]);

  // Update userNames with primary status
  const userNamesWithPrimary = useMemo(() => {
    return userNames.map((name) => ({
      ...name,
      isPrimary: name.name === primaryName,
    }));
  }, [userNames, primaryName]);

  const renewName = async (name: string) => {
    setRenewingNames(prev => new Set(prev).add(name));
    // The actual renew logic will be handled in the NameCard component
    // This is just for UI state management
  };

  const setPrimary = async (name: string) => {
    setSettingPrimary(prev => new Set(prev).add(name));
    // The actual set primary logic will be handled in the NameCard component
    // This is just for UI state management
  };

  const handleRenewComplete = (name: string) => {
    setRenewingNames(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const handleSetPrimaryComplete = (name: string) => {
    setSettingPrimary(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  const handleUpdateMetadataComplete = (name: string) => {
    setUpdatingMetadata(prev => {
      const newSet = new Set(prev);
      newSet.delete(name);
      return newSet;
    });
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Wallet not connected
        </h3>
        <p className="text-gray-500">
          Connect your wallet to manage your names
        </p>
      </div>
    );
  }

  if (nameRecords.isLoading || reverseRecords.isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="mx-auto text-gray-400 mb-4 animate-spin" size={48} />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Loading your names...
        </h3>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Your Names</h2>
        <div className="text-sm text-gray-600">
          {userNamesWithPrimary.length} name
          {userNamesWithPrimary.length !== 1 ? "s" : ""} registered
        </div>
      </div>

      {userNamesWithPrimary.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No names registered
          </h3>
          <p className="text-gray-500 mb-4">
            Register your first Solana name to get started
          </p>
          <button
            onClick={() => {
              // Navigate to register tab
              console.log("Navigate to register tab");
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Register Name
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {userNamesWithPrimary.map((nameData, index) => (
            <NameCard
              key={index}
              {...nameData}
              onRenew={renewName}
              onSetPrimary={setPrimary}
              isRenewing={renewingNames.has(nameData.name)}
              isUpdatingMetadata={updatingMetadata.has(nameData.name)}
              isSettingPrimary={settingPrimary.has(nameData.name)}
              onRenewComplete={() => handleRenewComplete(nameData.name)}
              onSetPrimaryComplete={() => handleSetPrimaryComplete(nameData.name)}
              onUpdateMetadataComplete={() => handleUpdateMetadataComplete(nameData.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface NameCardPropsExtended extends NameCardProps {
  onRenewComplete?: () => void;
  onSetPrimaryComplete?: () => void;
  onUpdateMetadataComplete?: () => void;
}

const NameCard: React.FC<NameCardPropsExtended> = ({
  name,
  owner,
  metadata,
  expiresAt,
  isPrimary,
  onRenew,
  onSetPrimary,
  isRenewing = false,
  isUpdatingMetadata = false,
  isSettingPrimary = false,
  onRenewComplete,
  onSetPrimaryComplete,
  onUpdateMetadataComplete,
}) => {
  const { publicKey } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [newMetadata, setNewMetadata] = useState(metadata);

  // Use the actual SNS hooks
  const { renewName, updateMetadata } = useSnsNameRecord({ name });
  const { setReverseRecord } = useSnsReverseRecord({ 
    userAddress: publicKey || new PublicKey('11111111111111111111111111111111') 
  });

  const expired = isExpired(expiresAt);
  const expiringSoon = true || isExpiringSoon(expiresAt);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const shortenAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleRenew = async () => {
    if (!publicKey) return;
    
    try {
      onRenew(name);
      await renewName.mutateAsync();
      onRenewComplete?.();
    } catch (error) {
      console.error("Error renewing name:", error);
      onRenewComplete?.();
    }
  };

  const handleSetPrimary = async () => {
    if (!publicKey) return;
    
    try {
      onSetPrimary(name);
      await setReverseRecord.mutateAsync({ name });
      onSetPrimaryComplete?.();
    } catch (error) {
      console.error("Error setting primary name:", error);
      onSetPrimaryComplete?.();
    }
  };

  const handleUpdateMetadata = async () => {
    if (!publicKey) return;
    
    try {
      await updateMetadata.mutateAsync({ newMetadata });
      setIsEditing(false);
      onUpdateMetadataComplete?.();
    } catch (error) {
      console.error("Error updating metadata:", error);
      onUpdateMetadataComplete?.();
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-200 ${
        isPrimary
          ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {name[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{name}</h3>
              {isPrimary && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  <Star className="fill-current" size={12} />
                  Primary
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm">
              Owner: {shortenAddress(owner)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isPrimary && (
            <button
              onClick={handleSetPrimary}
              disabled={isSettingPrimary || setReverseRecord.isPending}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              title="Set as primary"
            >
              {isSettingPrimary || setReverseRecord.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Star size={18} />
              )}
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isUpdatingMetadata || updateMetadata.isPending}
            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Edit metadata"
          >
            <Edit3 size={18} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Metadata
          </label>
          <textarea
            value={newMetadata}
            onChange={(e) => setNewMetadata(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            placeholder="Update metadata"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleUpdateMetadata}
              disabled={isUpdatingMetadata || updateMetadata.isPending}
              className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdatingMetadata || updateMetadata.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : null}
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setNewMetadata(metadata);
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
            {metadata || "No metadata provided"}
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span
            className={`text-sm flex items-center gap-1 ${
              expired
                ? "text-red-600"
                : expiringSoon
                  ? "text-yellow-600"
                  : "text-gray-600"
            }`}
          >
            {expired ? "Expired" : "Expires"} {formatDate(expiresAt)}
            {expired && <AlertCircle size={16} className="text-red-500" />}
            {expiringSoon && <Clock size={16} className="text-yellow-500" />}
          </span>
        </div>
        {(expired || expiringSoon) && (
          <button
            onClick={handleRenew}
            disabled={isRenewing || renewName.isPending}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              expired
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            {isRenewing || renewName.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Renew
          </button>
        )}
      </div>
    </div>
  );
};

export default Manage;