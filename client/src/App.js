import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import fagaruContract from "./contracts/FAGARU.json";

function App() {
  const [account, setAccount] = useState('');
  const [files, setFiles] = useState([]); // Prise en charge de plusieurs fichiers
  const [cidList, setCidList] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const contractABI = fagaruContract.abi;
  const contractAddress = "0xB5cf4989e6f137Bde7ef1242aCaEf02a523dbDbe";

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          setWeb3(web3Instance);
          const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
          setContract(contractInstance);
        } catch (error) {
          console.error("User denied account access or error occurred:", error);
        }
      } else {
        console.error("MetaMask not detected");
      }
    };
  
    initWeb3();
  }, [contractABI, contractAddress]);  // Ajout des dépendances nécessaires
  

  const handleFileChange = (e) => {
    setFiles([...e.target.files]); // Stocker plusieurs fichiers
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3 || !contract || !account) {
      console.error("Web3, contract, or account not initialized");
      return;
    }
    if (files.length === 0) {
      alert('Veuillez sélectionner au moins un fichier.');
      return;
    }

    setLoading(true); // Début du chargement

    try {
      const cids = [];
      for (const file of files) {
        const fileData = new FormData();
        fileData.append("file", file);

        const responseData = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: fileData,
          headers: {
            "Content-Type": "multipart/form-data",
            "pinata_api_key": "63855d7460dfb8d2f23e",
            "pinata_secret_api_key": "3df9c4e0db9ca268243185481b6fa7d0befb50ce6e9548489944346a316a57fd",
          },
        });

        const cid = responseData.data.IpfsHash;
        cids.push(cid);
        console.log(`CID pour ${file.name}: ${cid}`);

        const gasEstimate = await contract.methods
          .addRecord(cid, file.name, account)
          .estimateGas({ from: account });
        const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

        const result = await contract.methods
          .addRecord(cid, file.name, account)
          .send({ from: account, gas: gasLimit });

        console.log(`Transaction pour ${file.name} réussie:`, result);
      }
      setCidList(cids); // Enregistrer les CIDs
    } catch (error) {
      console.error('Erreur lors de la transaction :', error);
      alert(`Une erreur est survenue : ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  return (
    <div>
      <h1>Medical Records on Blockchain</h1>
      {account ? (
        <>
          <p>Connected account: {account}</p>
          <input type="file" onChange={handleFileChange} multiple />
          {loading ? (
            <p>Envoi en cours...</p>
          ) : (
            <button onClick={handleSubmit}>Upload to Pinata and Save CID</button>
          )}
          {cidList.length > 0 && (
            <div>
              <h2>Fichiers enregistrés :</h2>
              <ul>
                {cidList.map((cid, index) => (
                  <li key={index}>
                    CID: {cid}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p>Please connect to MetaMask</p>
      )}
    </div>
  );
}

export default App;
