const { ethers } = require("hardhat");

async function main() {
    // Récupérer le contrat
    const FagaruMVP = await ethers.getContractFactory("FagaruMVP");

    // Déployer le contrat
    const fagaru = await FagaruMVP.deploy();
    // Pas besoin d'appeler .deployed() dans les versions récentes

    console.log("Contrat déployé à l'adresse :", fagaru.target);

    // Initialiser le contrat
    const initialAdmin = "0x669A483CC88bCD8791e6B392130411C61498530F"; // Remplacez par l'adresse de l'administrateur initial
    const tx = await fagaru.initialize(initialAdmin); // Appelez la méthode d'initialisation
    await tx.wait(); // Attendez que la transaction soit minée

    console.log("Contrat initialisé avec l'administrateur :", initialAdmin);
}

// Exécuter le script
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
