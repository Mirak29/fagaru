import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import fagaruContract from "./contracts/FAGARU.json"

function App() {
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');
  
  // Add your contract ABI and address here
  const contractABI = fagaruContract.abi;
  
  const contractAddress = "0xB5cf4989e6f137Bde7ef1242aCaEf02a523dbDbe"; // Adresse de ton contrat déployé
  
  const web3 = new Web3(Web3.givenProvider);
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  // Connecter MetaMask
  useEffect(() => {
    const connectToMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          // console.log("Connected account:", accounts[0]);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("MetaMask not detected");
      }
    };

    connectToMetaMask();
  }, []);

  // Uploading file and interacting with smart contract
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fileData = new FormData();
      fileData.append("file", file);

      // Upload the file to Pinata
      const responseData = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          "Content-Type": "multipart/form-data",
          "pinata_api_key": process.env.REACT_APP_PINATA_API_KEY,
          "pinata_secret_api_key": process.env.REACT_APP_PINATA_SECRET_KEY,
        }
      });
      console.log("https://olive-many-canidae-360.mypinata.cloud/ipfs/" + responseData.data.IpfsHash);
      const cid = responseData.data.IpfsHash;
      setCid(cid);

      console.log(account);
      // Call the smart contract to store the CID
      await contract.methods.addRecord(cid, file.name, account).send({ from: account });
      
      console.log("CID enregistré sur la blockchain:", cid);
      
    } catch (error) {
      console.log(error);
    }
  }

  // Gestion du changement de fichier
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
      <h1>Medical Records on Blockchain</h1>
      {account ? (
        <>
          <p>Connected account: {account}</p>
          <input type="file" onChange={handleFileChange} />
          <button onClick={handleSubmit}>Upload to Pinata and Save CID</button>
          {cid && <p>File uploaded successfully. CID: {cid}</p>}
        </>
      ) : (
        <p>Please connect to MetaMask</p>
      )}
    </div>
  );
}

export default App;
