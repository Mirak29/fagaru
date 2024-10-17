import { ethers } from 'ethers';
import RoleManager from './artifacts/contracts/RoleManager.sol/RoleManager.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Adresse du contrat déployé
const contractAddress = "0xYourContractAddress";
const contract = new ethers.Contract(contractAddress, RoleManager.abi, signer);

// Fonction pour vérifier si l'utilisateur est un admin
async function checkIfAdmin() {
  const userAddress = await signer.getAddress();
  const isAdmin = await contract.isAdmin(userAddress);
  if (isAdmin) {
    console.log("Vous êtes administrateur.");
  } else {
    console.log("Vous n'êtes pas administrateur.");
  }
}

// Fonction pour ajouter un rôle utilisateur
async function addUser(addressToAdd) {
  const tx = await contract.addUserRole(addressToAdd);
  await tx.wait();
  console.log("Rôle utilisateur ajouté avec succès !");
}
