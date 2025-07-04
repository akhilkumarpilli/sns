"use client";

import Admin from "@/components/Admin";
import Manage from "@/components/Manage";
import RegisterName from "@/components/RegisterName";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

const TabButton = ({
  onClick,
  active,
  label,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
      active
        ? "bg-purple-600 text-white shadow-lg"
        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
    }`}
  >
    {label}
  </button>
);

export default function Home() {
  const { connected } = useWallet();
  const [activeTab, setActiveTab] = useState("register");
  const isAdmin = true;

  return (
    <div>
      {connected ? (
        <>
          <div className="container mx-auto px-6 py-8">
            {/* Navigation */}
            <nav className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-lg">
              <TabButton
                label="Register Name"
                active={activeTab === "register"}
                onClick={() => setActiveTab("register")}
              />
              <TabButton
                label="Manage Names"
                active={activeTab === "manage"}
                onClick={() => setActiveTab("manage")}
              />
              {isAdmin && (
                <TabButton
                  label="Admin Panel"
                  active={activeTab === "admin"}
                  onClick={() => setActiveTab("admin")}
                />
              )}
            </nav>

            {/* Register Tab */}
            {activeTab === "register" && <RegisterName />}

            {/* Manage Tab */}
            {activeTab === "manage" && <Manage />}

            {/* Admin Tab */}
            {activeTab === "admin" && isAdmin && <Admin />}
          </div>
        </>
      ) : null}
    </div>
  );
}
