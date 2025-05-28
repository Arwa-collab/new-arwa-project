"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Produit {
  id: string;
  typeProduit?: string;
  marque?: string;
  modele?: string;
  dateInsertion?: string;
  numeroMarche?: string;
  quantite?: number | string;
}

export default function SuperviseurStockPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "produits"), 
      (produitsSnap) => {
        const produitsList = produitsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Produit[];
        
        console.log("Données chargées depuis Firebase:", produitsList);
        setProduits(produitsList);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur Firebase:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleExportExcel = () => {
    console.log("=== DÉBUT EXPORT ===");
    console.log("Loading:", loading);
    console.log("Produits:", produits);
    console.log("Nombre de produits:", produits.length);

    if (loading) {
      alert("Les données sont encore en cours de chargement. Veuillez patienter.");
      return;
    }

    if (!produits || produits.length === 0) {
      alert("Aucune donnée à exporter");
      return;
    }

    try {
      // Méthode robuste avec Array of Arrays
      const headers = [
        "Type produit",
        "Marque", 
        "Modèle",
        "Date d'insertion",
        "N° de marché",
        "Quantité"
      ];

      const rows = produits.map(p => {
        console.log("Traitement produit:", p);
        return [
          p.typeProduit?.toString() || "",
          p.marque?.toString() || "",
          p.modele?.toString() || "",
          p.dateInsertion?.toString() || "",
          p.numeroMarche?.toString() || "",
          p.quantite?.toString() || "0"
        ];
      });

      const wsData = [headers, ...rows];
      console.log("Données pour Excel:", wsData); // doit contenir les entêtes + lignes

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Stock");

      const excelBuffer = XLSX.write(wb, { 
        bookType: "xlsx", 
        type: "array" 
      });

      const data = new Blob([excelBuffer], { type: "application/octet-stream" });

      const fileName = `stock_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      
      console.log("Export réussi:", fileName);
      alert("Export Excel réussi !");

    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  if (loading) {
    return (
      <AuthGuard allowedRoles={["superviseur"]}>
        <div className="p-4">
          <p>Chargement des données...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["superviseur"]}>
      <div className="p-4">
        <Link
          href="/dashboard"
          className="inline-block mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          ← Retour au dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-4">Consultation du stock</h1>

        <div className="mb-4 flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={loading || produits.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Exporter Excel ({produits.length} produits)
          </button>
          
          <button
            onClick={() => console.log("Données actuelles:", produits)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Debug données
          </button>
        </div>

        {produits.length === 0 ? (
          <p className="text-gray-500">Aucun produit trouvé dans la base de données.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">Type produit</th>
                  <th className="p-2 border">Marque</th>
                  <th className="p-2 border">Modèle</th>
                  <th className="p-2 border">Date d'insertion</th>
                  <th className="p-2 border">N° de marché</th>
                  <th className="p-2 border">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((produit) => (
                  <tr key={produit.id} className="text-center">
                    <td className="p-2 border">{produit.typeProduit || "-"}</td>
                    <td className="p-2 border">{produit.marque || "-"}</td>
                    <td className="p-2 border">{produit.modele || "-"}</td>
                    <td className="p-2 border">{produit.dateInsertion || "-"}</td>
                    <td className="p-2 border">{produit.numeroMarche || "-"}</td>
                    <td className="p-2 border">{produit.quantite ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}