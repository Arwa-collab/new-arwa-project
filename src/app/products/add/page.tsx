"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";

export default function AddProductPage() {
  const [formData, setFormData] = useState({
    typeProduit: "",
    marque: "",
    modele: "",
    dateInsertion: "",
    numeroMarche: "",
    quantite: 0,
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "quantite" ? parseInt(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await addDoc(collection(db, "produits"), {
        ...formData,
      });
      setSuccessMessage("Produit ajouté avec succès !");
      setFormData({
        typeProduit: "",
        marque: "",
        modele: "",
        dateInsertion: "",
        numeroMarche: "",
        quantite: 0,
      });
    } catch (error: any) {
      setErrorMessage("Erreur lors de l'ajout du produit : " + error.message);
    }
  };

  return (
    <AuthGuard allowedRoles={["responsable"]}>
      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Ajouter un produit</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="typeProduit"
            placeholder="Type de produit"
            className="w-full p-2 border rounded"
            value={formData.typeProduit}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="marque"
            placeholder="Marque"
            className="w-full p-2 border rounded"
            value={formData.marque}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="modele"
            placeholder="Modèle"
            className="w-full p-2 border rounded"
            value={formData.modele}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="dateInsertion"
            placeholder="Date d'insertion"
            className="w-full p-2 border rounded"
            value={formData.dateInsertion}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="numeroMarche"
            placeholder="N° de marché"
            className="w-full p-2 border rounded"
            value={formData.numeroMarche}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantite"
            placeholder="Quantité"
            className="w-full p-2 border rounded"
            value={formData.quantite}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Ajouter
          </button>
        </form>
        {successMessage && <p className="text-green-600 mt-2">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 mt-2">{errorMessage}</p>}
      </div>
    </AuthGuard>
  );
}
