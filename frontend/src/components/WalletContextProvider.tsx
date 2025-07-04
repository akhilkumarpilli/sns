"use client";

import React, { ReactNode, useMemo } from "react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { Globe } from "lucide-react";

import "@solana/wallet-adapter-react-ui/styles.css";
import { ReactQueryProvider } from "./ReactQueryProvider";
import { Toaster } from "sonner";

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
  const endpoint = "http://localhost:8899";
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);
  return (
    <ReactQueryProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletModalProvider>
            <header className="bg-white shadow-lg">
              <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <Globe className="text-white" size={20} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">
                        Solana Name Service
                      </h1>
                      <p className="text-gray-600 text-sm">
                        Your identity on Solana
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <WalletMultiButton />
                  </div>
                </div>
              </div>
            </header>
            <main>
              {children}
              <Toaster />
            </main>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ReactQueryProvider>
  );
};

export default WalletContextProvider;
