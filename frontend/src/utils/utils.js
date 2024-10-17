async function storeImageOnChain(cid) {
    try {
      const transaction = await contract.methods.storeImage(cid).send({ from: userAddress });
      console.log("Image CID stored on-chain:", transaction);
    } catch (error) {
      console.error("Erreur lors du stockage on-chain:", error);
    }
}