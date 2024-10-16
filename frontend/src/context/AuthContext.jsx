// "use client"
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import { ethers } from 'ethers';

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//   const [isConnected, setIsConnected] = useState(false);
//   const [signer, setSigner] = useState(null);
//   const [address, setAddress] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     checkConnection();
//     if (window.ethereum) {
//       window.ethereum.on('accountsChanged', handleAccountsChanged);
//       window.ethereum.on('chainChanged', () => window.location.reload());
//     }
//     return () => {
//       if (window.ethereum) {
//         window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
//       }
//     };
//   }, []);

//   async function checkConnection() {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const accounts = await provider.listAccounts();
//         if (accounts.length > 0) {
//           const signer = provider.getSigner();
//           const address = await signer.getAddress();
//           setIsConnected(true);
//           setSigner(signer);
//           setAddress(address);
//         }
//       } catch (err) {
//         console.error("Erreur lors de la vérification de la connexion:", err);
//         setError("Erreur de connexion à MetaMask");
//       }
//     }
//   }

//   async function connectToMetaMask() {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const provider = new ethers.providers.Web3Provider(window.ethereum);
//         const signer = provider.getSigner();
//         const address = await signer.getAddress();
//         setIsConnected(true);
//         setSigner(signer);
//         setAddress(address);
//       } catch (err) {
//         console.error("Erreur lors de la connexion à MetaMask:", err);
//         setError("Impossible de se connecter à MetaMask");
//       }
//     } else {
//       setError("MetaMask n'est pas installé");
//     }
//   }

//   async function signMessage() {
//     if (!signer) return;
//     try {
//       const message = `Connexion à MonApp: ${Date.now()}`;
//       const signature = await signer.signMessage(message);
      
//       const response = await fetch('/api/verify-signature', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ address, message, signature }),
//       });
      
//       if (response.ok) {
//         console.log("Authentification réussie!");
//         // Gérer l'authentification réussie ici
//       } else {
//         setError("Échec de l'authentification");
//       }
//     } catch (err) {
//       console.error("Erreur lors de la signature:", err);
//       setError("Erreur lors de la signature du message");
//     }
//   }

//   function handleAccountsChanged(accounts) {
//     if (accounts.length === 0) {
//       // L'utilisateur s'est déconnecté
//       setIsConnected(false);
//       setSigner(null);
//       setAddress(null);
//     } else if (accounts[0] !== address) {
//       // L'utilisateur a changé de compte
//       checkConnection();
//     }
//   }

//   const value = {
//     isConnected,
//     signer,
//     address,
//     error,
//     connectToMetaMask,
//     signMessage
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//     const context = useContext(AuthContext);
//     if (context === undefined) {
//       throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// }