import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { address, message, signature } = req.body;
    
    try {
      const signerAddr = await ethers.utils.verifyMessage(message, signature);
      if (signerAddr.toLowerCase() === address.toLowerCase()) {
        // Signature valide, vous pouvez créer une session ici
        res.status(200).json({ success: true });
      } else {
        res.status(401).json({ success: false, error: 'Signature invalide' });
      }
    } catch (err) {
      res.status(500).json({ success: false, error: 'Erreur de vérification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}