import React, { useState } from "react";
import {
  Search,
  RefreshCw,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useSnsProgram, useSnsNameRecord } from "../hooks/snsDataAccess";
import { useWallet } from "@solana/wallet-adapter-react";

const RegisterName = () => {
  const [searchName, setSearchName] = useState("");
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState("");
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const { publicKey, connected } = useWallet();
  const { registerName, config } = useSnsProgram();
  const { nameRecord } = useSnsNameRecord({ name: searchName });

  const checkAvailability = async () => {
    if (!searchName.trim()) return;

    setCheckingAvailability(true);
    try {
      // Check if name record exists
      const isAvailable = !nameRecord.data;
      setNameAvailable(isAvailable);
    } catch (error) {
      // If fetch fails, name is likely available
      setNameAvailable(true);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleRegister = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first");
      return;
    }

    if (!searchName.trim()) {
      alert("Please enter a name to register");
      return;
    }

    setLoading(true);
    try {
      await registerName.mutateAsync({
        name: searchName.trim(),
        metadata: metadata.trim() || "",
      });

      // Reset form after successful registration
      setSearchName("");
      setMetadata("");
      setNameAvailable(null);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = () => {
    if (!config.data || !searchName) return 0;
    const pricePerChar = config.data.pricePerChar;
    const nameLength = searchName.length;
    return (pricePerChar.toNumber() * nameLength) / 1e9; // Convert lamports to SOL
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Register Your Name
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for available names
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setNameAvailable(null);
                }}
                placeholder="Enter name (without .sol)"
                className="w-full p-4 border border-gray-300 rounded-lg pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="absolute right-4 top-4 text-gray-400">.sol</div>
            </div>
            {searchName && (
              <button
                onClick={checkAvailability}
                disabled={checkingAvailability}
                className="mt-2 w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {checkingAvailability ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Search size={20} />
                )}
                Check Availability
              </button>
            )}
          </div>

          {nameAvailable !== null && (
            <div
              className={`p-4 rounded-lg ${
                nameAvailable
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {nameAvailable ? (
                  <CheckCircle className="text-green-600" size={20} />
                ) : (
                  <XCircle className="text-red-600" size={20} />
                )}
                <span
                  className={`font-medium ${
                    nameAvailable ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {nameAvailable ? "Available!" : "Not Available"}
                </span>
              </div>

              {nameAvailable && (
                <div className="mt-2 text-sm text-green-700">
                  <span className="font-medium">{searchName}.sol</span> is ready
                  to be registered!
                </div>
              )}
            </div>
          )}

          {nameAvailable && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (Optional)
                </label>
                <input
                  type="text"
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  placeholder="e.g., Web3 Developer, Crypto Enthusiast"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {!connected ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-center">
                    Please connect your wallet to register a name
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={loading || registerName.isPending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading || registerName.isPending ? (
                    <RefreshCw className="animate-spin" size={20} />
                  ) : (
                    <DollarSign size={20} />
                  )}
                  Register for {calculateCost().toFixed(4)} SOL
                </button>
              )}
            </div>
          )}

          {config.isLoading && (
            <div className="text-center text-gray-500">
              Loading configuration...
            </div>
          )}

          {config.error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-center">
                Error loading configuration. Please try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterName;
