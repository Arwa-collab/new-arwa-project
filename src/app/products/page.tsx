"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";

interface Produit {
  id: string;
  nom: string;
  description: string;
  quantite: number;
  categorie: string;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const [form, setForm] = useState<Omit<Produit, "id">>({
    nom: "",
    description: "",
    quantite: 0,
    categorie: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categorieFiltre, setCategorieFiltre] = useState("Toutes");
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProduits = async () => {
    const snapshot = await getDocs(collection(db, "produits"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Produit[];

    setProduits(data);
    extraireCategories(data);
    filtrerProduits(data, categorieFiltre);
  };

  const extraireCategories = (data: Produit[]) => {
    const uniques = Array.from(new Set(data.map((p) => p.categorie)));
    setCategories(uniques);
  };

  const filtrerProduits = (data: Produit[], categorie: string) => {
    if (categorie === "Toutes") {
      setFilteredProduits(data);
    } else {
      setFilteredProduits(data.filter((p) => p.categorie === categorie));
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  useEffect(() => {
    filtrerProduits(produits, categorieFiltre);
  }, [categorieFiltre, produits]);

  const handleSubmit = async () => {
    if (editingId) {
      await updateDoc(doc(db, "produits", editingId), form);
      setEditingId(null);
    } else {
      await addDoc(collection(db, "produits"), form);
    }
    setForm({ nom: "", description: "", quantite: 0, categorie: "" });
    fetchProduits();
  };

  const handleEdit = (produit: Produit) => {
    setForm({
      nom: produit.nom,
      description: produit.description,
      quantite: produit.quantite,
      categorie: produit.categorie,
    });
    setEditingId(produit.id);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "produits", id));
    fetchProduits();
  };

  return (
    <AuthGuard allowedRoles={["responsable"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>

        {/* Formulaire */}
        <div className="mb-6 space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Nom"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Quantité"
            type="number"
            value={form.quantite}
            onChange={(e) =>
              setForm({ ...form, quantite: parseInt(e.target.value) })
            }
          />
          <input
            className="border p-2 w-full"
            placeholder="Catégorie"
            value={form.categorie}
            onChange={(e) => setForm({ ...form, categorie: e.target.value })}
          />
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {editingId ? "Modifier" : "Ajouter"}
          </button>
        </div>

        {/* Filtre par catégorie */}
        <div className="mb-4">
          <label className="mr-2 font-medium">Filtrer par catégorie :</label>
          <select
            className="border p-2"
            value={categorieFiltre}
            onChange={(e) => setCategorieFiltre(e.target.value)}
          >
            <option value="Toutes">Toutes</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Liste des produits */}
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Quantité</th>
              <th className="p-2 border">Catégorie</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProduits.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.nom}</td>
                <td className="p-2 border">{p.description}</td>
                <td className="p-2 border">{p.quantite}</td>
                <td className="p-2 border">{p.categorie}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthGuard>
  );
}
