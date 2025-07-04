import React, { useState, useEffect } from "react";
import { Crown, Copy, RefreshCw, DollarSign, Settings, AlertCircle } from "lucide-react";
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';
import { useSnsProgram } from "@/hooks/snsDataAccess";

const Admin = () => {
  const [pricePerChar, setPricePerChar] = useState(0.001);
  const [treasuryAddress, setTreasuryAddress] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { publicKey, connected } = useWallet();
  const { config, initializeConfig, withdrawFees, nameRecords } = useSnsProgram();

  // Check if current user is admin
  const isAdmin = config.data && publicKey && config.data.admin.equals(publicKey);
  const isConfigInitialized = !!config.data;

  useEffect(() => {
    if (config.data) {
      setPricePerChar(config.data.pricePerChar.toNumber() / 1e9); // Convert lamports to SOL
      setTreasuryAddress(config.data.treasury.toString());
    }
  }, [config.data]);

  const handleInitializeConfig = async () => {
    if (!connected || !publicKey) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!treasuryAddress) {
      toast.error("Please enter a treasury address");
      return;
    }

    try {
      const treasuryPubkey = new PublicKey(treasuryAddress);
      setIsInitializing(true);
      
      await initializeConfig.mutateAsync({
        admin: publicKey,
        treasury: treasuryPubkey,
        pricePerChar: Math.floor(pricePerChar * 1e9), // Convert SOL to lamports
      });

      toast.success("Configuration initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize config:", error);
      toast.error("Failed to initialize configuration");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleWithdrawFees = async () => {
    if (!isAdmin) {
      toast.error("Only admin can withdraw fees");
      return;
    }

    setLoading(true);
    try {
      await withdrawFees.mutateAsync();
    } catch (error) {
      console.error("Failed to withdraw fees:", error);
      toast.error("Failed to withdraw fees");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const calculateStats = () => {
    if (!nameRecords.data) return { total: 0, active: 0, expiring: 0, expired: 0 };

    const now = Date.now() / 1000;
    const weekFromNow = now + (7 * 24 * 60 * 60);

    const total = nameRecords.data.length;
    const active = nameRecords.data.filter(record => record.account.expiresAt.toNumber() > now).length;
    const expiring = nameRecords.data.filter(record => {
      const expiresAt = record.account.expiresAt.toNumber();
      return expiresAt > now && expiresAt < weekFromNow;
    }).length;
    const expired = nameRecords.data.filter(record => record.account.expiresAt.toNumber() <= now).length;

    return { total, active, expiring, expired };
  };

  const stats = calculateStats();

  if (!connected) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-yellow-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Wallet Not Connected</h3>
              <p className="text-yellow-700">Please connect your wallet to access the admin panel.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isConfigInitialized) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Crown className="text-yellow-500" size={24} />
          <h2 className="text-2xl font-bold">Admin Panel - Initialize Configuration</h2>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={20} />
            Initialize System Configuration
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Character (SOL)
              </label>
              <input
                type="number"
                step="0.001"
                value={pricePerChar}
                onChange={(e) => setPricePerChar(parseFloat(e.target.value) || 0)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treasury Address
              </label>
              <input
                type="text"
                value={treasuryAddress}
                onChange={(e) => setTreasuryAddress(e.target.value)}
                placeholder="Enter treasury public key"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This will initialize the SNS configuration with you as the admin. 
                Make sure to set the correct treasury address and pricing before proceeding.
              </p>
            </div>

            <button
              onClick={handleInitializeConfig}
              disabled={isInitializing || initializeConfig.isPending}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isInitializing || initializeConfig.isPending ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <Settings size={20} />
              )}
              Initialize Configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Access Denied</h3>
              <p className="text-red-700">You are not authorized to access this admin panel.</p>
              <p className="text-red-600 text-sm mt-1">
                Admin: {config.data?.admin.toString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Character (SOL)
              </label>
              <input
                type="number"
                step="0.001"
                value={pricePerChar}
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current price: {pricePerChar} SOL per character
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treasury Address
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={treasuryAddress}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg bg-gray-50"
                />
                <button 
                  onClick={() => copyToClipboard(treasuryAddress)}
                  className="px-3 border-t border-r border-b border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Address
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={config.data?.admin.toString() || ""}
                  readOnly
                  className="flex-1 p-3 border border-gray-300 rounded-l-lg bg-gray-50"
                />
                <button 
                  onClick={() => copyToClipboard(config.data?.admin.toString() || "")}
                  className="px-3 border-t border-r border-b border-gray-300 rounded-r-lg hover:bg-gray-50"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Revenue & Withdrawals</h3>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-green-700 font-medium">
                  Available to Withdraw
                </span>
                <span className="text-2xl font-bold text-green-800">
                  {config.isLoading ? "..." : "Check Program Balance"}
                </span>
              </div>
            </div>
            <button
              onClick={handleWithdrawFees}
              disabled={loading || withdrawFees.isPending}
              className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading || withdrawFees.isPending ? (
                <RefreshCw className="animate-spin" size={20} />
              ) : (
                <DollarSign size={20} />
              )}
              Withdraw Fees
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">System Stats</h3>
        {nameRecords.isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
            <p className="text-gray-500">Loading statistics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Names</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Names</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.expiring}</div>
              <div className="text-sm text-gray-600">Expiring Soon</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;