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
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import { saveAs } from "file-saver";//impo
import Link from "next/link";
import { Home } from "lucide-react";
import { BorderStyle } from "docx";


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

  // Récupération des demandes Firestore
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

  // Mise à jour du statut (acceptée ou refusée)
  const handleStatut = async (id: string, statut: "acceptée" | "refusée") => {
    const demande = demandes.find((d) => d.id === id);
    if (!demande) return;

    try {
      if (statut === "acceptée") {
        await deduireQuantiteStock(
          demande.typeProduit,
          demande.marque,
          demande.modele,
          demande.quantite
        );
      }

      await updateDoc(doc(db, "demandes", id), { statut });

      // Envoi d'email supprimé ici

      fetchDemandes();
    } catch (error) {
      console.error("Erreur de mise à jour :", error);
    }
  };

  // Générer un fichier Word pour une demande acceptée
  const generateWord = async (demande: Demande) => {
    const docWord = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Fiche de retrait de fourniture",
                  bold: true,
                  size: 60,
                  font: "Arial",
                  color: "2E74B5",
                }),
              ],
              alignment: "center",
              spacing: { after: 300 },
              border: {
                bottom: { color: "2E74B5", space: 1, style: BorderStyle.SINGLE, size: 6 },
              },
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [
                new TextRun({ text: `Nom du demandeur : `, bold: true }),
                new TextRun(`${demande.nom} ${demande.prenom}`),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Produit demandé : ", bold: true }),
                new TextRun(
                  `${demande.typeProduit} - ${demande.modele} - ${demande.marque}`
                ),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Quantité : ", bold: true }),
                new TextRun(`${demande.quantite}`),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Date de la demande : ", bold: true }),
                new TextRun(
                  demande.date && typeof demande.date.toDate === "function"
                    ? demande.date.toDate().toLocaleString()
                    : typeof demande.date === "string"
                    ? demande.date
                    : "Date inconnue"
                ),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({ text: "" }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Signature du demandeur : ___________________________",
                              italics: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      width: { size: 50, type: WidthType.PERCENTAGE },
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({
                              text: "Signature du responsable : ___________________________",
                              italics: true,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
              width: { size: 100, type: WidthType.PERCENTAGE },
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
              <th className="p-2 border">Nom</th>
              <th className="p-2 border">Prénom</th>
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
                <td className="p-2 border">{demande.nom}</td>
                <td className="p-2 border">{demande.prenom}</td>
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

async function deduireQuantiteStock(typeProduit: string, marque: string, modele: string, quantiteDemandee: number) {
  if (!typeProduit || !marque || !modele) {
    alert("Produit manquant !");
    return;
  }

  const produitsRef = collection(db, "produits");
  const q = query(
    produitsRef,
    where("typeProduit", "==", typeProduit.trim().toUpperCase()),
    where("marque", "==", marque.trim().toUpperCase()),
    where("modele", "==", modele.trim().toUpperCase())
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    alert("Produit non trouvé !");
    return;
  }

  const produitDoc = querySnapshot.docs[0];
  const produitData = produitDoc.data();
  const nouvelleQuantite = (produitData.quantite || 0) - quantiteDemandee;

  if (nouvelleQuantite < 0) {
    alert("Stock insuffisant !");
    return;
  }

  await updateDoc(produitDoc.ref, { quantite: nouvelleQuantite });
}

async function ajouterProduit(typeProduit: string, marque: string, modele: string, quantite: number) {
  if (!typeProduit || !marque || !modele) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  try {
    await addDoc(collection(db, "produits"), {
      typeProduit: typeProduit.trim().toLowerCase(),
      marque: marque.trim().toLowerCase(),
      modele: modele.trim().toLowerCase(),
      quantite,
      // autres champs...
    });
    alert("Produit ajouté avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit :", error);
    alert("Erreur lors de l'ajout du produit.");
  }
}

async function modifierProduit(produitId: string, typeProduit: string, marque: string, modele: string, quantite: number) {
  if (!produitId || !typeProduit || !marque || !modele) {
    alert("Veuillez remplir tous les champs obligatoires.");
    return;
  }

  try {
    await updateDoc(doc(db, "produits", produitId), {
      typeProduit: typeProduit.trim().toLowerCase(),
      marque: marque.trim().toLowerCase(),
      modele: modele.trim().toLowerCase(),
      quantite,
      // autres champs...
    });
    alert("Produit modifié avec succès !");
  } catch (error) {
    console.error("Erreur lors de la modification du produit :", error);
    alert("Erreur lors de la modification du produit.");
  }
}

