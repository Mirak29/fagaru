import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import fagaruContract from "./contracts/FAGARU.json";

function App() {
  const [account, setAccount] = useState('');
  const [file, setFile] = useState(null);
  const [cid, setCid] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [userRole, setUserRole] = useState('');
  
  const contractABI = fagaruContract.abi;
  const contractAddress = "0x8d58117371b6d4e44E5D026649515271840d1EE9";

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
          await getUserRole(contractInstance, accounts[0]);
        } catch (error) {
          console.error("User denied account access or error occurred:", error);
        }
      } else {
        console.error("MetaMask not detected");
      }
    };

    initWeb3();
  }, [contractABI, contractAddress]);


  const getUserRole = async (contractInstance, userAccount) => {
    try {
      const role = await contractInstance.methods.getSenderRole().call({ from: userAccount });
      setUserRole(role);
    } catch (error) {
      console.error("Error getting user role:", error);
      setUserRole('unknown');
    }
  };

  const deleteFileFromPinata = async (cid) => {
    try {
      await axios.delete(`https://api.pinata.cloud/pinning/unpin/${cid}`, {
        headers: {
          "pinata_api_key": process.env.REACT_APP_PINATA_API_KEY,
          "pinata_secret_api_key": process.env.REACT_APP_PINATA_SECRET_KEY,
        },
      });
      console.log(`File with CID ${cid} deleted from Pinata.`);
    } catch (error) {
      console.error('Error deleting file from Pinata:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!web3 || !contract || !account) {
      console.error("Web3, contract, or account not initialized");
      return;
    }

    try {
      const fileData = new FormData();
      fileData.append("file", file);

      const responseData = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        fileData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "pinata_api_key": process.env.REACT_APP_PINATA_API_KEY,
            "pinata_secret_api_key": process.env.REACT_APP_PINATA_SECRET_KEY,
          },
        }
      );

      const cid = responseData.data.IpfsHash;
      setCid(cid);

      console.log(`Connected account: ${account}`);
      console.log(`CID to be added: ${cid}`);

      const gasEstimate = await contract.methods.addRecord(cid, file.name, account).estimateGas({ from: account });
      const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

      const result = await contract.methods.addRecord(cid, file.name, account)
        .send({ from: account, gas: gasLimit })
        .on('transactionHash', (hash) => {
          console.log('Transaction hash:', hash);
        })
        .on('confirmation', (confirmationNumber, receipt) => {
          console.log('Transaction confirmed:', receipt);
        })
        .on('error', async (error) => {
          console.error('Transaction error:', error);
          console.log('Deleting uploaded file from Pinata...');
          await deleteFileFromPinata(cid);  // Supprimer le fichier si la transaction échoue
        });

      console.log("Transaction result:", result);
      console.log("CID enregistré sur la blockchain:", cid);

    } catch (error) {
      console.error('Error:', error);
      if (cid) {
        console.log('Deleting uploaded file from Pinata due to an error...');
        await deleteFileFromPinata(cid);  // Supprimer le fichier en cas d'erreur
      }
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div>
      <h1>Medical Records on Blockchain</h1>
      {account ? (
        <>
          <p>Connected account: {account}</p>
          <p>User role: {userRole}</p>
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
