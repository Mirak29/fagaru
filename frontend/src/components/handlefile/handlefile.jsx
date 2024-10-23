import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import fagaruContract from "../../contracts/FAGARU.json";

function App() {
  const [account, setAccount] = useState('');
  const [files, setFiles] = useState([]); // Prise en charge de plusieurs fichiers
  const [cidList, setCidList] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const [ispatient, setIspatient] = useState(false);
  const [isdoctor, setIsdoctor] = useState(false);

  
  const contractABI = fagaruContract.abi;
  const contractAddress = "0xf8455E5f7e656EFA35C0E64A357831D6F826b522";

    // Exemple d'ajout d'un docteur
    const addDoctor = async () => {
      if (!isInitialized || !contract || !account ) {
        console.log("En attente de l'initialisation...");
        return;
      }
      try {
        const gasEstimate = await contract?.methods.addDoctor().estimateGas({ from: account });
        const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

        await contract?.methods.addDoctor().send({ from: account, gas: gasLimit });
        console.log("Docteur ajouté avec succès");
      } catch (error) {
        console.error('Erreur lors de l\'ajout du docteur :', error);
      }
    };

    const addPatient = async (patientAddress) => {    
      if (!isInitialized || !contract || !account ) {
        console.log("En attente de l'initialisation...");
        return;
      }
      try {
        const gasEstimate = await contract?.methods.addPatient(patientAddress).estimateGas({ from: account });
        const gasLimit = Math.floor(Number(gasEstimate) * 1.2);
    
        await contract?.methods.addPatient(patientAddress).send({ from: account, gas: gasLimit });
        console.log("Patient ajouté avec succès");
      } catch (error) {
        console.error('Erreur lors de l\'ajout du patient :', error);
      }
    };

    const checkRole = async (acc) => {
      if (!isInitialized || !contract || !acc) {
        console.log("En attente de l'initialisation...");
        return;
      }
      const role = await contract?.methods.getSenderRole().call({ from: acc });
      console.log("Rôle de l'expéditeur :", role);
    };

    const fetchRecords = async (account) => {
      if (!isInitialized || !contract || !account) {
        console.log("En attente de l'initialisation...");
        return;
      }
  
      setLoading(true);
      setError(null);
  
      try {
        const records = await getRecordsWithRetry(account);
        
        // Traitement des records si nécessaire
        const processedRecords = records.map(record => ({
          ...record,
          // Ajoutez ici des transformations si nécessaire
        }));
  
        setFiles(processedRecords);
        
      } catch (err) {
        console.error("Erreur détaillée:", err);
        setError("Impossible de récupérer les fichiers");
      } finally {
        setLoading(false);
      }
    };

    const getRecordsWithRetry = async (account) => {
      if (!isInitialized || !contract || !account) {
        console.log("En attente de l'initialisation...");
        return;
      }
      try {
        // Vérifications de base
        if (!contract || !contract?.methods || !account) {
          throw new Error("Contract ou account non initialisé");
        }
    
        // Appel à getRecords avec gestion du gas
        const records = await contract?.methods
          .getRecords("0x1234567890abcdef1234567890abcdef12345678")
          .call({
            from: account,
          });
    
        console.log("✅ Records récupérés:", records);
        return records;
    
      } catch (error) {
        console.error("❌ Erreur lors de la récupération des records:", {
          message: error.message,
          code: error.code
        });
        throw error;
      }
    };

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (accounts.length > 0) {
            const userAccount = accounts[0];
            const contractInstance = new web3Instance.eth.Contract(
              contractABI, 
              contractAddress
            );

            setWeb3(web3Instance);
            setContract(contractInstance);
            setAccount(userAccount);
            setIsInitialized(true);
            if (checkRole(account) == "doctor") {
                setIsdoctor(true)
            } else if (checkRole("0x1234567890abcdef1234567890abcdef12345678") == "patient") {
                setIspatient(true)
            }
            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
              if (newAccounts.length > 0) {
                setAccount(newAccounts[0]);
              } else {
                setAccount('');
              }
            });
          }
        } else {
          throw new Error("MetaMask n'est pas détecté");
        }
      } catch (err) {
        console.error("Erreur d'initialisation:", err);
        setError(err.message);
      }
    };
    

    initWeb3();
    addDoctor();
    const patientAddress = "0x1234567890abcdef1234567890abcdef12345678";
    addPatient(patientAddress);
    fetchRecords(account)
    // Cleanup function
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {
          console.log('Listener removed');
        });
      }
    };
  }, [contractABI, isInitialized]); // Ajout des dépendances nécessaires

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
          .addRecord(cid, file.name, "0x1234567890abcdef1234567890abcdef12345678")
          .estimateGas({ from: account });
        const gasLimit = Math.floor(Number(gasEstimate) * 1.2);

        const result = await contract.methods
          .addRecord(cid, file.name, "0x1234567890abcdef1234567890abcdef12345678")
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
      {account ? (
        <>
          <input type="file" className='file-input file-input-bordered w-full max-w-xs' onChange={handleFileChange} multiple />
          {loading ? (
            <p>Envoi en cours...</p>
          ) : (
            <button className='btn btn-xs ml-4' onClick={handleSubmit}>Upload</button>
          )}
        </>
      ) : (
        <p>Please connect to MetaMask</p>
      )}

    {/* <div>
      <h1>Mes fichiers</h1>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            <a href={`https://gateway.pinata.cloud/ipfs/${file.cid}`} download>
              {file.fileName}
            </a>
          </li>
        ))}
      </ul>
    </div> */}
    </div>
  );
}

export default App;
