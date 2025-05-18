"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import AuthGuard from "@/components/AuthGuard";
import emailjs from "emailjs-com";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

interface Demande {
  id: string;
  nomProduit: string;
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
      await updateDoc(doc(db, "demandes", id), { statut });

      // Envoi de mail via EmailJS
      if (demande.email) {
        await emailjs.send(
          "service_8r7ijwy",
          "template_57nb838",
          {
            to_name: `${demande.nom} ${demande.prenom}`,
            to_email: demande.email,
            message: `Votre demande pour le produit "${demande.nomProduit}" a été ${statut}.`,
            reply_to: "noreply@gestion-stock.com",
          },
          "ppQXj_kQeOvSNd5a7"
        );
      }

      // Mise à jour de la liste après modification
      fetchDemandes();
    } catch (error) {
      console.error("Erreur de mise à jour ou d'envoi d'e-mail :", error);
    }
  };

  // Générer un fichier Word pour une demande acceptée
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
              children: [new TextRun(`Produit demandé : ${demande.nomProduit}`)],
            }),
            new Paragraph({
              children: [new TextRun(`Quantité : ${demande.quantite}`)],
            }),
            new Paragraph({
              children: [
                new TextRun(
                  `Date de la demande : ${demande.date.toDate().toLocaleString()}`
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
    saveAs(blob, `retrait_${demande.nom}_${demande.nomProduit}.docx`);
  };

  useEffect(() => {
    fetchDemandes();
  }, []);

  return (
    <AuthGuard allowedRoles={["responsable"]}>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Liste des demandes</h1>
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Nom du produit</th>
              <th className="p-2 border">Quantité</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Statut</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {demandes.map((d) => (
              <tr key={d.id}>
                <td className="p-2 border">{d.nomProduit}</td>
                <td className="p-2 border">{d.quantite}</td>
                <td className="p-2 border">
                  {d.date?.toDate().toLocaleString() ?? "Date inconnue"}
                </td>
                <td className="p-2 border capitalize">{d.statut}</td>
                <td className="p-2 border space-x-2">
                  {d.statut === "en attente" ? (
                    <>
                      <button
                        onClick={() => handleStatut(d.id, "acceptée")}
                        className="bg-green-600 text-white px-2 py-1 rounded"
                      >
                        Accepter
                      </button>
                      <button
                        onClick={() => handleStatut(d.id, "refusée")}
                        className="bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Refuser
                      </button>
                    </>
                  ) : d.statut === "acceptée" ? (
                    <button
                      onClick={() => generateWord(d)}
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
