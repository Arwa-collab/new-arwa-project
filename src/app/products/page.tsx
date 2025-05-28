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
import Link from "next/link";
import { Home } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Produit {
  id: string;
  typeProduit: string;
  marque: string;
  modele: string;
  dateInsertion: string;
  numeroMarche: string;
  quantite: number;
}

export default function ProduitsPage() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const [form, setForm] = useState<Omit<Produit, "id">>({
    typeProduit: "",
    marque: "",
    modele: "",
    dateInsertion: "",
    numeroMarche: "",
    quantite: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filtre, setFiltre] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "produits"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Produit[];

      console.log("Données chargées:", data);
      setProduits(data);
      filtrerProduits(data, filtre);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      setLoading(false);
    }
  };

  const filtrerProduits = (data: Produit[], filtre: string) => {
    if (!filtre) {
      setFilteredProduits(data);
    } else {
      const lowerFiltre = filtre.toLocaleUpperCase();
      setFilteredProduits(
        data.filter((p) =>
          Object.values(p)
            .join(" ")
            .toLocaleUpperCase()
            .includes(lowerFiltre)
        )
      );
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  useEffect(() => {
    filtrerProduits(produits, filtre);
  }, [filtre, produits]);

  const handleSubmit = async () => {
    try {
      const dataToSave = {
        ...form,
        typeProduit: form.typeProduit.trim().toLocaleUpperCase(),
        marque: form.marque.trim().toLocaleUpperCase(),
        modele: form.modele.trim().toLocaleUpperCase(),
      };

      if (editingId) {
        await updateDoc(doc(db, "produits", editingId), dataToSave);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "produits"), dataToSave);
      }
      setForm({
        typeProduit: "",
        marque: "",
        modele: "",
        dateInsertion: "",
        numeroMarche: "",
        quantite: 0,
      });
      fetchProduits();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleEdit = (produit: Produit) => {
    setForm({
      typeProduit: produit.typeProduit,
      marque: produit.marque,
      modele: produit.modele,
      dateInsertion: produit.dateInsertion,
      numeroMarche: produit.numeroMarche,
      quantite: produit.quantite,
    });
    setEditingId(produit.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        await deleteDoc(doc(db, "produits", id));
        fetchProduits();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleExportExcel = () => {
    console.log("=== DÉBUT EXPORT PRODUITS ===");
    console.log("Loading:", loading);
    console.log("Produits:", produits);
    console.log("Produits filtrés:", filteredProduits);
    console.log("Nombre de produits:", produits.length);
    console.log("Nombre de produits filtrés:", filteredProduits.length);

    if (loading) {
      alert("Les données sont encore en cours de chargement. Veuillez patienter.");
      return;
    }

    // Utiliser les produits filtrés ou tous les produits si pas de filtre
    const dataToExport = filteredProduits.length > 0 ? filteredProduits : produits;

    if (!dataToExport || dataToExport.length === 0) {
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

      const rows = dataToExport.map(p => {
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

      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      const fileName = `stock_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      
      console.log("Export réussi:", fileName);
      alert(`Export Excel réussi ! ${dataToExport.length} produits exportés.`);

    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export Excel");
    }
  };

  const uniqueValues = (key: keyof Produit) => {
    return Array.from(new Set(produits.map((p) => p[key]).filter(Boolean)));
  };

  return (
    <AuthGuard allowedRoles={["responsable"]}>
      <div className="p-6 max-w-5xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Home className="h-4 w-4" />
          Tableau de bord
        </Link>
        <h1 className="text-2xl font-bold mb-4">Gestion des produits</h1>

        {/* Formulaire */}
        <div className="mb-6 space-y-2">
          <input
            className="border p-2 w-full"
            placeholder="Type de produit"
            value={form.typeProduit}
            onChange={(e) => setForm({ ...form, typeProduit: e.target.value })}
            list="typeProduit-list"
          />
          <datalist id="typeProduit-list">
            {uniqueValues("typeProduit").map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>
          <input
            className="border p-2 w-full"
            placeholder="Marque"
            value={form.marque}
            onChange={(e) => setForm({ ...form, marque: e.target.value })}
            list="marque-list"
          />
          <datalist id="marque-list">
            {uniqueValues("marque").map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>

          <input
            className="border p-2 w-full"
            placeholder="Modèle"
            value={form.modele}
            onChange={(e) => setForm({ ...form, modele: e.target.value })}
            list="modele-list"
          />
          <datalist id="modele-list">
            {uniqueValues("modele").map((val) => (
              <option key={val} value={val} />
            ))}
          </datalist>

          <input
            className="border p-2 w-full"
            placeholder="Date"
            type="date"
            value={form.dateInsertion}
            onChange={(e) => setForm({ ...form, dateInsertion: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="N° de marché"
            value={form.numeroMarche}
            onChange={(e) => setForm({ ...form, numeroMarche: e.target.value })}
            list="modele-list"
          />
          <input
            className="border p-2 w-full"
            placeholder="Quantité"
            type="number"
            value={form.quantite}
            onChange={(e) =>
              setForm({ ...form, quantite: parseInt(e.target.value) || 0 })
            }
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {editingId ? "Modifier" : "Ajouter"}
          </button>
        </div>

        {/* Filtre global */}
        <div className="mb-4">
          <label className="mr-2 font-medium">Filtrer :</label>
          <input
            className="border p-2 w-64"
            placeholder="Rechercher dans tous les champs..."
            value={filtre}
            onChange={(e) => setFiltre(e.target.value)}
          />
        </div>
        <div className="mb-2 font-semibold text-green-700">
          Quantité totale :{" "}
          {filteredProduits.reduce((total, p) => total + (Number(p.quantite) || 0), 0)}
        </div>

        {/* Boutons d'action */}
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={loading || (filteredProduits.length === 0 && produits.length === 0)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Exporter Excel ({filtre ? filteredProduits.length : produits.length} produits)
          </button>
          
          <button
            onClick={() => {
              console.log("=== DEBUG DONNÉES ===");
              console.log("Produits:", produits);
              console.log("Produits filtrés:", filteredProduits);
              console.log("Filtre actuel:", filtre);
              console.log("Loading:", loading);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Debug données
          </button>
        </div>

        {/* Indicateur de chargement */}
        {loading && (
          <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
            Chargement des données...
          </div>
        )}

        {/* Message si aucun produit */}
        {!loading && produits.length === 0 && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded">
            Aucun produit trouvé dans la base de données.
          </div>
        )}

        {/* Message si aucun résultat de filtre */}
        {!loading && produits.length > 0 && filteredProduits.length === 0 && filtre && (
          <div className="mb-4 p-4 bg-orange-100 text-orange-800 rounded">
            Aucun produit ne correspond au filtre "{filtre}".
          </div>
        )}

        {/* Liste des produits */}
        {!loading && filteredProduits.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Type produit</th>
                  <th className="p-2 border">Marque</th>
                  <th className="p-2 border">Modèle</th>
                  <th className="p-2 border">Date d'insertion</th>
                  <th className="p-2 border">N° de marché</th>
                  <th className="p-2 border">Quantité</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduits.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2 border">{p.typeProduit}</td>
                    <td className="p-2 border">{p.marque}</td>
                    <td className="p-2 border">{p.modele}</td>
                    <td className="p-2 border">{p.dateInsertion}</td>
                    <td className="p-2 border">{p.numeroMarche}</td>
                    <td className="p-2 border">{p.quantite}</td>
                    <td className="p-2 border space-x-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
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