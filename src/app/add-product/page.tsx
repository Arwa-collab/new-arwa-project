"use client"; // Active le mode client de Next.js (utile pour les hooks comme useState)

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Référence à la base de données Firestore
import { useRouter } from "next/navigation"; // Pour rediriger après l'ajout

export default function AddProductPage() {
  // État local pour stocker les données du formulaire
  const [form, setForm] = useState({
    categorie: "",
    marque: "",
    quantite: 0,
    numeroMarche: "",
    seuilCritique: 0,
  });

  const router = useRouter();

  // Gère le changement dans les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      // Convertit en nombre les champs numériques
      [e.target.name]: e.target.name === "quantite" || e.target.name === "seuilCritique"
        ? Number(e.target.value)
        : e.target.value,
    });
  };

  // Gère la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Ajoute un document dans la collection "produits"
      await addDoc(collection(db, "produits"), {
        ...form,
        dateInsertion: Timestamp.now(), // Ajout de la date d'insertion
      });
      alert("Produit ajouté !");
      router.push("/dashboard"); // Redirection vers le dashboard
    } catch (error) {
      console.error("Erreur ajout produit:", error);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Champs du formulaire */}
        <input name="categorie" onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Catégorie" />
        <input name="marque" onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Marque" />
        <input name="quantite" type="number" onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Quantité" />
        <input name="numeroMarche" onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Numéro du marché" />
        <input name="seuilCritique" type="number" onChange={handleChange} required className="w-full p-2 border rounded" placeholder="Seuil critique" />
        
        {/* Bouton de soumission */}
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Ajouter
        </button>
      </form>
    </div>
  );
}
