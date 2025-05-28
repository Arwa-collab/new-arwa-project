"use client"; // Indique à Next.js que ce composant s'exécute côté client

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs } from "firebase/firestore"; // Fonctions Firestore pour ajouter et récupérer des documents
import { db } from "@/lib/firebase"; // Connexion à la base de données Firebase
import { getAuth } from "firebase/auth"; // Pour accéder à l'utilisateur authentifié
import { useRouter } from "next/navigation"; // Pour la navigation programmatique
import AuthGuard from "@/components/AuthGuard"; // Composant de protection d'accès

/**
 * Interface définissant la structure d'un produit
 * @typedef {Object} Product
 * @property {string} id - Identifiant unique du produit
 * @property {string} marque - Nom ou marque du produit
 * @property {number} quantite - Quantité disponible en stock
 */
interface Product {
  id: string;
  typeProduit: string;
  modele: string;
  marque: string;
  quantite: number;
}

/**
 * Composant principal pour créer une nouvelle demande de produit
 * Permet à un employé de sélectionner un produit et d'en demander une quantité
 */
function AddDemandePage() {
  // États pour gérer les données et l'interface utilisateur
  const [produits, setProduits] = useState<Product[]>([]); // Liste des produits disponibles
  const [selectedProductId, setSelectedProductId] = useState(""); // ID du produit sélectionné
  const [quantiteDemandee, setQuantiteDemandee] = useState<number>(1); // Quantité demandée (défaut: 1)
  const [loading, setLoading] = useState(false); // État de chargement pour l'UI
  const router = useRouter(); // Pour la redirection après soumission

  /**
   * Effet qui s'exécute au chargement du composant pour récupérer
   * la liste des produits depuis Firestore
   */
  useEffect(() => {
    const fetchProduits = async () => {
      const snapshot = await getDocs(collection(db, "produits")); // Récupère tous les documents de la collection "produits"
      const data = snapshot.docs.map((doc) => ({
        id: doc.id, // Extrait l'ID du document
        ...doc.data(), // Déstructure les données du document
      })) as Product[];
      setProduits(data); // Met à jour l'état avec les produits récupérés
    };

    fetchProduits(); // Exécute la fonction au montage du composant
  }, []); // Tableau de dépendances vide = exécuté une seule fois au montage

  /**
   * Gère la soumission du formulaire de demande
   * @param {React.FormEvent} e - Événement de soumission du formulaire
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setLoading(true); // Active l'indicateur de chargement

    const auth = getAuth(); // Récupère l'instance d'authentification
    const user = auth.currentUser; // Obtient l'utilisateur actuellement connecté

    // Vérifie que l'utilisateur est connecté
    if (!user) {
      alert("Utilisateur non connecté.");
      return;
    }

    try {
      // Crée un nouveau document dans la collection "demandes"
      await addDoc(collection(db, "demandes"), {
        produitId: selectedProductId,
        quantite: quantiteDemandee,
        statut: "en attente",
        date: new Date(),
        userId: user.uid,
        // Ajoute les infos du produit pour faciliter la gestion
        ...produits.find((p) => p.id === selectedProductId),
      });

      router.push("/demandes"); // Redirige vers la page des demandes après succès
    } catch (error) {
      console.error("Erreur lors de l'ajout de la demande :", error);
    } finally {
      setLoading(false); // Désactive l'indicateur de chargement dans tous les cas
    }
  };

  /**
   * Rendu du composant - formulaire de création de demande
   */
  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nouvelle demande</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Sélection du produit */}
        <div>
          <label className="block mb-1">Produit</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">-- Choisir un produit --</option>
            {produits.map((p) => (
              <option key={p.id} value={p.id}>
                {p.marque} (dispo: {p.quantite})
              </option>
            ))}
          </select>
        </div>
        
        {/* Saisie de la quantité */}
        <div>
          <label className="block mb-1">Quantité demandée</label>
          <input
            type="number"
            min="1" // Empêche les valeurs négatives ou nulles
            value={quantiteDemandee}
            onChange={(e) => setQuantiteDemandee(Number(e.target.value))}
            className="w-full border p-2 rounded"
            required
          />
        </div>
        
        {/* Bouton de soumission avec état de chargement */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading} // Désactive le bouton pendant le chargement
        >
          {loading ? "Envoi en cours..." : "Envoyer la demande"}
        </button>
      </form>
    </div>
  );
}

/**
 * Composant wrapper qui protège la page de création de demande
 * S'assure que seuls les utilisateurs avec le rôle "employe" peuvent y accéder
 * @returns {JSX.Element} Composant protégé par AuthGuard
 */
export default function ProtectedAddDemandePage() {
  return (
    <AuthGuard allowedRoles={["employe"]}>
      <AddDemandePage />
    </AuthGuard>
  );
}