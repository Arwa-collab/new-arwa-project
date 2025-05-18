"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function StatistiquesPage() {
  const [stats, setStats] = useState({
    totalProduits: 0,
    totalStock: 0,
    demandesAttente: 0,
    demandesAcceptees: 0,
    demandesRefusees: 0,
  });

  const [produitsDemandes, setProduitsDemandes] = useState<
    { nom: string; total: number }[]
  >([]);

  const fetchStatistiques = async () => {
    const produitsSnapshot = await getDocs(collection(db, "produits"));
    const totalProduits = produitsSnapshot.size;
    const totalStock = produitsSnapshot.docs.reduce((acc, doc) => {
      const data = doc.data();
      return acc + (data.quantite || 0);
    }, 0);

    const demandesSnapshot = await getDocs(collection(db, "demandes"));
    let demandesAttente = 0;
    let demandesAcceptees = 0;
    let demandesRefusees = 0;

    const compteurDemandes: Record<string, number> = {};

    demandesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const statut = data.statut;
      const nomProduit = data.nomProduit;

      if (statut === "en attente") demandesAttente++;
      else if (statut === "acceptée") demandesAcceptees++;
      else if (statut === "refusée") demandesRefusees++;

      if (nomProduit) {
        compteurDemandes[nomProduit] = (compteurDemandes[nomProduit] || 0) + 1;
      }
    });

    const produitsDemandesSorted = Object.entries(compteurDemandes)
      .map(([nom, total]) => ({ nom, total }))
      .sort((a, b) => b.total - a.total);

    setStats({
      totalProduits,
      totalStock,
      demandesAttente,
      demandesAcceptees,
      demandesRefusees,
    });

    setProduitsDemandes(produitsDemandesSorted);
  };

  useEffect(() => {
    fetchStatistiques();
  }, []);

  const COLORS = ["#facc15", "#4ade80", "#f87171"];
  const dataPie = [
    { name: "En attente", value: stats.demandesAttente },
    { name: "Acceptée", value: stats.demandesAcceptees },
    { name: "Refusée", value: stats.demandesRefusees },
  ];

  return (
    <AuthGuard allowedRoles={["responsable"]}>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Statistiques Générales</h1>

        {/* Cartes chiffres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded shadow border">
            <h2 className="text-lg font-semibold mb-2">Produits</h2>
            <p>Total de produits : {stats.totalProduits}</p>
            <p>Quantité totale en stock : {stats.totalStock}</p>
          </div>

          <div className="p-4 bg-white rounded shadow border">
            <h2 className="text-lg font-semibold mb-2">Demandes</h2>
            <p>En attente : {stats.demandesAttente}</p>
            <p>Acceptées : {stats.demandesAcceptees}</p>
            <p>Refusées : {stats.demandesRefusees}</p>
          </div>
        </div>

        {/* Graphique camembert */}
        <div className="mt-8 p-4 bg-white rounded shadow border">
          <h2 className="text-lg font-semibold mb-4">Répartition des demandes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en barres */}
        {produitsDemandes.length > 0 && (
          <div className="mt-8 p-4 bg-white rounded shadow border">
            <h2 className="text-lg font-semibold mb-4">
              Produits les plus demandés (Graphique)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={produitsDemandes}>
                <XAxis dataKey="nom" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#60a5fa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tableau produits les plus demandés */}
        <div className="mt-8 p-4 bg-white rounded shadow border">
          <h2 className="text-lg font-semibold mb-2">Produits les plus demandés</h2>
          {produitsDemandes.length === 0 ? (
            <p>Aucune demande enregistrée.</p>
          ) : (
            <table className="w-full border mt-2">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Produit</th>
                  <th className="p-2 border">Nombre de demandes</th>
                </tr>
              </thead>
              <tbody>
                {produitsDemandes.map((prod, index) => (
                  <tr key={index}>
                    <td className="p-2 border">{prod.nom}</td>
                    <td className="p-2 border">{prod.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
