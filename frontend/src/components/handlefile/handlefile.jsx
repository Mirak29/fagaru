import React, {useRef, useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');
  const fileInputRef = useRef(null);


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
      console.log("------------", process.env.REACT_APP_PINATA_API_KEY)

      const responseData = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: fileData,
        headers: {
          "Content-Type": "multipart/form-data",
          "pinata_api_key": "63855d7460dfb8d2f23e",
          "pinata_secret_api_key": "3df9c4e0db9ca268243185481b6fa7d0befb50ce6e9548489944346a316a57fd",
        }
      })
      console.log("https://olive-many-canidae-360.mypinata.cloud/ipfs/" + responseData.data.IpfsHash);
      setCid(responseData.data.IpfsHash);
      fileInputRef.current.value = ''; // Nettoyer l'input file
    } catch (error) {
      console.log(error);
    }
  }

  // Gestion du changement de fichier
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
  {account ? (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} />
      <button onClick={handleSubmit}>submit</button>
    </>
  ) : (
    ""
  )}
</div>

  );
}

export default App;