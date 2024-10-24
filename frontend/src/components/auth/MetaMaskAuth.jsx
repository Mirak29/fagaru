"use client"
import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [isConnected, setIsConnected] = useState(false);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState('');
  const [role, setRole] = useState('');


  useEffect(() => {
    const connectToMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          setIsConnected(true)
          console.log("---", accounts)
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("MetaMask not detected");
      }
    }
    connectToMetaMask()
  }, [isConnected]);
  

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
  const checkRole = async (acc) => {
    if (!isInitialized || !contract || !acc) {
      console.log("En attente de l'initialisation...");
      return;
    }
    const role = await contract?.methods.getSenderRole().call({ from: acc });
    setRole(role)
    };

  return (
    <AppContext.Provider value={{ isConnected, signer, error, account, signMessage, role }}>
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