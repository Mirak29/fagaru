"use client"
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState('');


  useEffect(() => {
    const connectToMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          setIsConnected(true)
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("MetaMask not detected");
      }
    }
    connectToMetaMask()
  }, []);

  async function checkConnection() {
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setIsConnected(true);
          setSigner(provider.getSigner());
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la connexion:", err);
        setError("Erreur de connexion à MetaMask");
      }
    }
  }

  // async function connectToMetaMask() {
  //   if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  //     try {
  //       await window.ethereum.request({ method: 'eth_requestAccounts' });
  //       const provider = new ethers.providers.Web3Provider(window.ethereum);
  //       setSigner(provider.getSigner());
  //       setIsConnected(true);
  //     } catch (err) {
  //       console.error("Erreur lors de la connexion à MetaMask:", err.message || err);
  //       setError("Impossible de se connecter à MetaMask");
  //     }
  //   } else {
  //     setError("MetaMask n'est pas installé");
  //   }
  // }
  

  async function signMessage() {
    if (!signer) return;
    try {
      const address = await signer.getAddress();
      const message = `Connexion à MonApp: ${Date.now()}`;
      const signature = await signer.signMessage(message);
      
      // Envoyer la signature au backend pour vérification
      const response = await fetch('/api/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature }),
      });
      
      if (response.ok) {
        console.log("Authentification réussie!");
        // Gérer l'authentification réussie ici
      } else {
        setError("Échec de l'authentification");
      }
    } catch (err) {
      console.error("Erreur lors de la signature:", err);
      setError("Erreur lors de la signature du message");
    }
  }

  return (
    <AppContext.Provider value={{ isConnected, signer, error, account, signMessage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default function MetaMaskAuth() {
  const { isConnected, error, connectToMetaMask, signMessage } = useApp();

  return (
    <div>
      {!isConnected ? (
        <button onClick={connectToMetaMask}>Se connecter avec MetaMask</button>
      ) : (
        <button onClick={signMessage}>Signer le message</button>
      )}
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}