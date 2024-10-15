import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';

function App() {
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');

  // Connecter MetaMask
  useEffect(() => {
    const connectToMetaMask = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
        } catch (error) {
          console.error("User denied account access");
        }
      } else {
        console.error("MetaMask not detected");
      }
    };

    connectToMetaMask();
  }, []);

  //uploading file
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fileData = new FormData();
      fileData.append("file", file);

      const responseData = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          "Content-Type": "multipart/form-data",
          "pinata_api_key": process.env.REACT_APP_PINATA_API_KEY,
          "pinata_secret_api_key": process.env.REACT_APP_PINATA_SECRET_KEY,
        }
      })
      console.log("https://olive-many-canidae-360.mypinata.cloud/ipfs/" + responseData.data.IpfsHash);
      setCid(responseData.data.IpfsHash);
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
          <button onClick={handleSubmit}>Upload to Pinata</button>
          {cid && <p>File uploaded successfully. CID: {cid}</p>}
        </>
      ) : (
        <p>Please connect to MetaMask</p>
      )}
    </div>
  );
}

export default App;
