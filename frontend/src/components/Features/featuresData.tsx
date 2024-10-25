import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <img src="images/registration-svgrepo-com.svg" alt=""/>
    ),
    title: "Inscription des patients",
    paragraph:
      "L'inscription des patients est exclusivement gérée par les médecins autorisés, qui peuvent ajouter de nouveaux patients au système en utilisant leur adresse blockchain unique.",
  },
  {
    id: 1,
    icon: (
      <img src="images/data-collection-svgrepo-com.svg" alt=""/>
    ),
    title: "Stockage et accès aux données",
    paragraph:
      "Les dossiers médicaux sont stockés de manière décentralisée avec des identifiants uniques (CID). Chaque dossier contient les informations du patient et l'historique médical complet.",
  },
  {
    id: 1,
    icon: (
      <img src="images/gui-refresh-svgrepo-com.svg" alt=""/>
    ),
    title: "Mises à jour en temps réel",
    paragraph:
      "Toute nouvelle information médicale est immédiatement enregistrée dans la blockchain, permettant un accès instantané aux données mises à jour pour les utilisateurs autorisés.",
  },

  {
    id: 1,
    icon: (
      <img src="images/gui-refresh-svgrepo-com.svg" alt=""/>
    ),
    title: "Accès aux patients et aux médecins",
    paragraph:
      "FAGARU implémente un double niveau d'accès pour protéger les informations médicales. Les médecins disposent d'un accès privilégié pour créer et consulter les dossiers de leurs patients, tandis que les patients peuvent uniquement consulter leurs propres informations médicales. Ce système assure une gestion transparente des données tout en maintenant la confidentialité nécessaire.",
  },
  {
    id: 1,
    icon: (
      <img src="images/access-padlock-protection-security-unlock-svgrepo-com.svg" alt=""/>
    ),
    title: "Sécurité de la blockchain",
    paragraph:
      "La technologie blockchain de FAGARU garantit une sécurité optimale des données médicales. Chaque action est enregistrée de façon permanente et immuable, avec une authentification sécurisée des utilisateurs via des adresses uniques. Le système assure une traçabilité complète des accès, permettant de suivre qui a consulté ou modifié les informations et quand.",
  }
];
export default featuresData;
