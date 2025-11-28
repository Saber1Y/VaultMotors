"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCallback } from "react";

export function useWalletConnection() {
  const {
    ready,
    authenticated,
    user,
    login,
    logout,
    connectWallet,
    createWallet,
  } = usePrivy();

  const { wallets } = useWallets();

  const connectExternalWallet = useCallback(async () => {
    if (!authenticated) {
      await login();
    } else {
      await connectWallet();
    }
  }, [authenticated, login, connectWallet]);

  const createEmbeddedWallet = useCallback(async () => {
    if (!authenticated) {
      await login();
    } else {
      await createWallet();
    }
  }, [authenticated, login, createWallet]);

  const disconnectWallet = useCallback(async () => {
    await logout();
  }, [logout]);

  // Get the primary wallet
  const primaryWallet = wallets[0];
  const walletAddress = primaryWallet?.address;

  return {
    // State
    isReady: ready,
    isAuthenticated: authenticated,
    user,
    wallets,
    primaryWallet,
    walletAddress,

    login,
    logout,
    connectExternalWallet,
    createEmbeddedWallet,
    disconnectWallet,

    hasWallet: wallets.length > 0,
    isEmbeddedWallet: primaryWallet?.walletClientType === "privy",
  };
}
