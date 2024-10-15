import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

function App() {
  const [account, setAccount] = useState('');

  useEffect(() => {
    const connectToMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]); // Définit le compte connecté
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("MetaMask not detected");
      }
    };

    connectToMetaMask(); // Appel de la fonction pour se connecter à MetaMask
  }, []);

  return (
    <div>
      <h1>Medical Records on Blockchain</h1>
      {account ? (
        <p>Connected account: {account}</p>
      ) : (
        <p>Please connect to MetaMask</p>
      )}
    </div>
  );
}

export default App;
