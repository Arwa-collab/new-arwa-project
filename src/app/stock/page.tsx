"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";

interface Produit {
  id: string;
  nom: string;
  description: string;
  quantite: number;
  categorie: string;
}

export default function StockPage() {
  const [produits, setProduits] = useState<Produit[]>([]);

  const fetchProduits = async () => {
    const snapshot = await getDocs(collection(db, "produits"));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Produit[];
    setProduits(data);
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  return (
    <AuthGuard allowedRoles={["employe"]}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Stock disponible</h1>
        {produits.length === 0 ? (
          <p>Aucun produit trouvé.</p>
        ) : (
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Description</th>
                <th className="p-2 border">Quantité</th>
                <th className="p-2 border">Catégorie</th>
              </tr>
            </thead>
            <tbody>
              {produits.map((p) => (
                <tr key={p.id}>
                  <td className="p-2 border">{p.nom}</td>
                  <td className="p-2 border">{p.description}</td>
                  <td className="p-2 border">{p.quantite}</td>
                  <td className="p-2 border">{p.categorie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AuthGuard>
  );
}
