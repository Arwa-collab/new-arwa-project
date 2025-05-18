"use client"; // Active le mode client nécessaire pour les hooks

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard"; // Protection d'accès par rôle

export default function DemandePage() {
  const router = useRouter();

  // État local pour les champs du formulaire
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    entite: "",
  });

  const [error, setError] = useState(""); // Pour afficher les erreurs

  // Gère les modifications dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;
    if (!user) return setError("Utilisateur non connecté"); // Vérifie l'utilisateur connecté

    try {
      await addDoc(collection(db, "demandes"), {
        ...formData,
        demandeurId: user.uid, // ID de l'utilisateur Firebase
        date: serverTimestamp(), // Timestamp de la demande
        statut: "en_attente", // Statut par défaut
      });

      router.push("/dashboard"); // Redirection après succès
    } catch (err: any) {
      setError("Erreur lors de l'envoi de la demande");
    }
  };

  return (
    // Seuls les utilisateurs avec le rôle "employe" peuvent voir cette page
    <AuthGuard allowedRoles={["employe"]}>
      <div className="max-w-md mx-auto p-4 mt-10">
        <h1 className="text-2xl font-bold mb-4">Faire une demande</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Génère dynamiquement les 4 champs de texte */}
          {["nom", "prenom", "matricule", "entite"].map((field) => (
            <input
              key={field}
              name={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)} // Affiche la première lettre en majuscule
              className="w-full p-2 border rounded"
              value={(formData as any)[field]}
              onChange={handleChange}
              required
            />
          ))}

          {/* Bouton de soumission */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Envoyer la demande
          </button>

          {/* Message d'erreur s'il y en a */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </div>
    </AuthGuard>
  );
}
