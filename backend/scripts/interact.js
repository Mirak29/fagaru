// scripts/interact.js

const { ethers } = require("ethers");
const contractABI = require("/home/mirak/Mirak/fagaru/backend/artifacts/contracts/Lock.sol/FagaruMVP.json").abi; // Chemin vers votre ABI
const contractAddress = "0x48Ab1a0a4d1A6b2051f80d2d85bca9f5840036ab"; // Remplacez par l'adresse de votre contrat déployé

async function main() {
    // Se connecter à Ganache
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:7545"); // URL de Ganache
    const wallet = new ethers.Wallet("0xa0088002a30xabbe8ae0f7857e57682bf41bfd48568274c3c1703cd7497d19593aeaa6adb4f4d6b2d5597831d14f5bacee23ee5d9cd8f4c85c433723f149393fb8", provider); // Remplacez par la clé privée de votre compte Ganache
    
    // Créer une instance de contrat
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Exemple : Créer un utilisateur
    const userAddress = "0xce0674fb75560D9C20Ba90ce144004E0E09C13DA"; // Remplacez par l'adresse de l'utilisateur
    const role = ethers.utils.formatBytes32String("DOCTOR_ROLE"); // Remplacez par le rôle approprié

    // Appel de la fonction createUser
    await contract.createUser(userAddress, role);
    console.log("Utilisateur créé :", userAddress);

    // // Exemple : Créer un dossier médical
    // const dataHash = "hash_du_dossier"; // Remplacez par le hash de vos données
    // const tx = await contract.createMedicalRecord(userAddress, dataHash);
    // console.log("Dossier médical créé avec l'ID :", tx.toString());

    // // Exemple : Obtenir un dossier médical
    // const medicalRecord = await contract.getMedicalRecord(tx.toString());
    // console.log("Dossier médical :", medicalRecord);
}

// Exécuter le script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
