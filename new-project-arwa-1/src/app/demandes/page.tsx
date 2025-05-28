"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import Link from "next/link";
import { Home } from "lucide-react";

interface Demande {
  id: string;
  typeProduit: string;
  modele: string;
  marque: string;
  quantite: number;
  date: Timestamp;
  statut: "en attente" | "acceptée" | "refusée";
  nom?: string;
  prenom?: string;
  email?: string; 
}

export default function DemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);

  const fetchDemandes = async () => {
    try {
      const snap = await getDocs(collection(db, "demandes"));
      const data = snap.docs.map((doc) => {
        const demandeData = doc.data();
        return {
          id: doc.id,
          ...demandeData,
        };
      }) as Demande[];
      setDemandes(data);
    } catch (error) {
      console.error("Erreur de récupération des demandes :", error);
    }
  };

  const handleStatut = async (id: string, statut: "acceptée" | "refusée") => {
    const demande = demandes.find((d) => d.id === id);
    if (!demande) return;

    try {
      if (statut === "acceptée") {
        await deduireQuantiteStock(demande.typeProduit, demande.quantite);
      }

      await updateDoc(doc(db, "demandes", id), { statut });
      fetchDemandes();
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    }
  };

  const generateWord = async (demande: Demande) => {
    const docWord = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Fiche de retrait de fourniture",
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun(`Nom du demandeur : ${demande.nom} ${demande.prenom}`),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun(
                  `Produit demandé : ${demande.typeProduit} - ${demande.modele} - ${demande.marque}`
                ),
              ],
            }),
            new Paragraph({
              children: [new TextRun(`Quantité : ${demande.quantite}`)],
            }),
            new Paragraph({
              children: [
                new TextRun(
                  `Date de la demande : ${
                    demande.date && typeof demande.date.toDate === "function"
                      ? demande.date.toDate().toLocaleString()
                      : typeof demande.date === "string"
                      ? demande.date
                      : "Date inconnue"
                  }`
                ),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun("Signature du demandeur : ___________________________"),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(docWord);
    saveAs(
      blob,
      `retrait_${demande.nom}_${demande.typeProduit}_${demande.modele}_${demande.marque}.docx`
    );
  };

  async function deduireQuantiteStock(typeProduit: string, quantiteDemandee: number) {
    if (!typeProduit) {
      alert("Type de produit manquant !");
      return;
    }
    const produitsRef = collection(db, "produits");
    const q = query(produitsRef, where("typeProduit", "==", typeProduit));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Produit non trouvé !");
      return;
    }

    const produitDoc = snapshot.docs[0];
    const produitData = produitDoc.data();
    const nouvelleQuantite = (produitData.quantite || 0) - quantiteDemandee;

    if (nouvelleQuantite < 0) {
      alert("Stock insuffisant !");
      return;
    }

    await updateDoc(doc(db, "produits", produitDoc.id), { quantite: nouvelleQuantite });
  }

  useEffect(() => {
    fetchDemandes();
  }, []);

  return (
    <AuthGuard allowedRoles={["responsable"]}>
      <div className="p-4 max-w-4xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Home className="h-4 w-4" />
          Tableau de bord
        </Link>
        <h1 className="text-2xl font-bold mb-4">Liste des demandes</h1>
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Type de produit</th>
              <th className="p-2 border">Modèle</th>
              <th className="p-2 border">Marque</th>
              <th className="p-2 border">Quantité</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(demandes || []).map((demande) => (
              <tr key={demande.id}>
                <td className="p-2 border">{demande.typeProduit}</td>
                <td className="p-2 border">{demande.modele}</td>
                <td className="p-2 border">{demande.marque}</td>
                <td className="p-2 border">{demande.quantite}</td>
                <td className="p-2 border">
                  {demande.date && typeof demande.date.toDate === "function"
                    ? demande.date.toDate().toLocaleString()
                    : typeof demande.date === "string"
                    ? demande.date
                    : "Date inconnue"}
                </td>
                <td className="p-2 border capitalize">{demande.statut}</td>
                <td className="p-2 border space-x-2">
                  {demande.statut === "en attente" ? (
                    <>
                      <button
                        onClick={() => handleStatut(demande.id, "acceptée")}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatut(demande.id, "refusée")}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Refuser
                      </button>
                    </>
                  ) : demande.statut === "acceptée" ? (
                    <button
                      onClick={() => generateWord(demande)}
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      Générer Word
                    </button>
                  ) : (
                    <span className="text-gray-500">Refusée</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthGuard>
  );
}