"use client";
import React, { useEffect, useState } from "react";
import { useApp } from "../auth/MetaMaskAuth";
import fagaruContract from "../../contracts/FAGARU.json";
import Web3 from 'web3';
import AddPatient from "./AddPatient";
import FileUpload from "../handlefile/handlefile"
import { strict } from "assert";


const PatientsFiles = () => {

  const { isConnected, signer, acc, signMessage } = useApp();
  if (!isConnected) {
    return;
  }

  const [files, setFiles] = useState([]); // Prise en charge de plusieurs fichiers
  const [contract, setContract] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [tosearch, settosearch] = useState("");
  const [accountid, setAccountid] = useState('');
  const [role, setRole] = useState("")
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [searchsuccess, setSearchsuccess] = useState(false);


  const contractABI = fagaruContract.abi;
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADRESS;

  const checkRole = async (acc) => {
    if (!contract || !acc) {
      console.log("En attente de l'initialisation...");
      return;
    }

    const role = await contract?.methods.getSenderRole().call({ from: acc });
    if (role == 'patient') {
      settosearch(acc)
      setAccountid(acc)
      fetchRecords();
    } 
    setRole(role)
  };

  const patientsExists = async (account) => {
    if (!account && role == "doctor") {
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
        .getPatientExists(tosearch)
        .call({
          from: accountid,
        });

      console.log("✅ Records récupérés:", records);
      return records

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des records:")
    }
  }

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (window.ethereum) {
          const web3Instance = new Web3(window.ethereum); // web3 instance created here
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
            setAccountid(userAccount);

            // Listen for account changes
            window.ethereum.on('accountsChanged', (newAccounts) => {
              if (newAccounts.length > 0) {
                setAccountid(newAccounts[0]);
              } else {
                setAccountid('');
              }
            });
          }
        } else {
          throw new Error("MetaMask n'est pas détecté");
        }
      } catch (err) {
        console.error("Erreur d'initialisation:", err);
      }
    };

    initWeb3();
    checkRole(accountid);
    // Cleanup function to remove event listener
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', () => {
          console.log('Listener removed');
         
        });
      }
    };
  }, [contractABI, accountid, files]);  // Dependency array includes contractABI


  const getRecordsWithRetry = async (account) => {
    if (!account) {
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
        .getRecords(account)
        .call({
          from: accountid,
        });

      console.log("✅ Records récupérés:", records);
      return records

    } catch (error) {
      console.error("❌ Erreur lors de la récupération des records:", {
        message: error.message,
        code: error.code
      });
      throw error;
    }
  };

  const fetchRecords = async () => {
    if (!isConnected && role == "doctor" ) {
      console.log("En attente de l'initialisation...");
      return;
    }

    try {
      const records = await getRecordsWithRetry(tosearch);      

      console.log("-----", records );

      // Traitement des records si nécessaire
      const processedRecords = records?.map(record => ({
        ...record,
        // Ajoutez ici des transformations si nécessaire
      }));

      setFiles(processedRecords);      

    } catch (err) {
      console.error("Erreur détaillée:", err);   
      setFiles('')   
    }

    try {

      const isExists = await patientsExists(accountid);


      if (isExists) {
        settosearch(tosearch);
        setError("");
        setSearchsuccess(true)
        setResult(tosearch);
      } else {
        setError("Clé invalide ou existante");
        setSearchsuccess(false)
      }
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError("Clé invalide ou existante");
      settosearch("")
      setFiles('')
    }
  };

  const handleFileChange = (e) => {
    console.log(e.target.value)
    settosearch(e.target.value)

  }

  const formatDate = (s) => {
    const timestamp = Number(s.timeAdded); // Convertir BigInt en Number si nécessaire
    const dateAdded = new Date(timestamp * 1000)

    return dateAdded.toLocaleString();
  }

  return (
    <>
      <section id="contact" className="overflow-hidden py-16 md:py-20 lg:py-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4 lg:w-7/12 xl:w-8/12">
              {role == "doctor" ? (
                <div
                  className="mb-12 rounded-sm bg-white px-8 py-11 shadow-three dark:bg-gray-dark sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]"
                  data-wow-delay=".15s
              "
                >
                  <h2 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-2xl xl:text-3xl">
                    Selectionner patient
                  </h2>

                  <label className="input h-20 bg-white dark:bg-dark input-bordered flex items-center gap-2">
                    <input type="text" onChange={handleFileChange} className="h-12 p-4 grow" placeholder="0x1234567890abcdef1234567890abcdef12345678" />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="h-4 w-4 opacity-70">
                      <path
                        fillRule="evenodd"
                        d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                        clipRule="evenodd" />
                    </svg>
                    <button onClick={fetchRecords}>Rechercher</button>
                  </label>
                  <br />
                  {<p className="text-red-500">{error}</p>}
                  <br />

                  {!error.length > 0 && result.length > 0 ? <FileUpload tosearch={tosearch} /> : ""}
                </div>
              )
                : ""
              }
              <div className="w-full px-4">
                {
                  (files?.length != 0 ?
                    <h1 className="mb-4 text-2xl font-bold leading-tight text-black dark:text-white">Dossiers Patient</h1>
                    : "")
                }
                <div className="overflow-x-auto">

                  <table className="table">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Nom</th>
                        <th>Date d'ajout</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files?.length != 0 ? (files?.map((file, index) => (
                        <tr key={index}>
                          <th>{index + 1}</th>
                          <td>
                            <a href={`https://gateway.pinata.cloud/ipfs/${file.cid}`} target="blank" download>
                              {file.fileName}
                            </a>
                          </td>
                          <td>
                            {formatDate(file)}
                          </td>
                        </tr>
                      ))) : "Aucun fichier"}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {
              role == "doctor" ? (
                <div className="w-full px-4 lg:w-5/12 xl:w-4/12">
                  <AddPatient contract={contract} role={role} account={accountid} />
                </div>) : ("")
            }
          </div>
        </div>
      </section>
    </>
  );
};

export default PatientsFiles;
