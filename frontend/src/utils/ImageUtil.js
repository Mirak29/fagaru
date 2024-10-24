import { ethers } from 'ethers';
import ImageStorage from './artifacts/contracts/ImageStorage.sol/ImageStorage.json';

// Connexion à la blockchain
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// Adresse du contrat déployé
const contractAddress = process.env.CONTRACT_ADRESS;
const contract = new ethers.Contract(contractAddress, ImageStorage.abi, signer);

// Fonction pour uploader une image
async function uploadImageToBlockchain(cid, name, description) {
  try {
    const transaction = await contract.uploadImage(cid, name, description);
    await transaction.wait();
    console.log("Image uploaded to blockchain:", transaction);
  } catch (error) {
    console.error("Erreur lors de l'upload sur la blockchain:", error);
  }
}

// Fonction pour récupérer une image
async function getImageFromBlockchain(id) {
  try {
    const image = await contract.getImage(id);
    console.log("Image:", image);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image:", error);
  }
}
