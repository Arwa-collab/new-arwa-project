"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard";
import { jsPDF } from "jspdf";

interface Demande {
  id: string;
  entite: string;
  date: Timestamp;
  statut: "en attente" | "acceptée" | "refusée";
}

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [filteredDemandes, setFilteredDemandes] = useState<Demande[]>([]);
  const [statutFilter, setStatutFilter] = useState("tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocSnap = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid))
        );
        const userData = userDocSnap.docs[0]?.data();
        const matricule = userData?.matricule;

        if (!matricule) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "demandes"),
          where("demandeurId", "==", matricule),
          orderBy("date", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Demande[];

        setDemandes(data);
        setFilteredDemandes(data);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (statutFilter === "tous") {
      setFilteredDemandes(demandes);
    } else {
      setFilteredDemandes(demandes.filter((d) => d.statut === statutFilter));
    }
  }, [statutFilter, demandes]);

  const handleTelechargerPDF = (demande: Demande) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Fiche de Demande de Fourniture", 20, 20);

    doc.setFontSize(12);
    doc.text(`ID de la demande : ${demande.id}`, 20, 40);
    doc.text(`Entité : ${demande.entite}`, 20, 50);
    doc.text(
      `Date : ${
        demande.date && "toDate" in demande.date
          ? demande.date.toDate().toLocaleString()
          : "N/A"
      }`,
      20,
      60
    );
    doc.text(`Statut : ${demande.statut}`, 20, 70);

    doc.text("Signature de l'employé : ______________________", 20, 100);
    doc.text("Signature du responsable : ___________________", 20, 120);

    doc.save(`demande-${demande.id}.pdf`);
  };

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <AuthGuard allowedRoles={["employe"]}>
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mes demandes</h1>

        <div className="mb-4">
          <label htmlFor="filtre" className="font-medium mr-2">
            Filtrer par statut :
          </label>
          <select
            id="filtre"
            aria-label="Filtrer les demandes par statut"
            value={statutFilter}
            onChange={(e) => setStatutFilter(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="tous">Tous</option>
            <option value="en attente">En attente</option>
            <option value="acceptée">Acceptée</option>
            <option value="refusée">Refusée</option>
          </select>
        </div>

        {filteredDemandes.length === 0 ? (
          <p>Aucune demande trouvée.</p>
        ) : (
          <ul className="space-y-4">
            {filteredDemandes.map((demande) => (
              <li
                key={demande.id}
                className="border p-4 rounded shadow bg-white"
              >
                <p>
                  <strong>Entité :</strong> {demande.entite}
                </p>
                <p>
                  <strong>Date :</strong>{" "}
                  {demande.date && "toDate" in demande.date
                    ? demande.date.toDate().toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Statut :</strong>{" "}
                  <span
                    className={`capitalize px-2 py-1 rounded ${
                      demande.statut === "acceptée"
                        ? "bg-green-100 text-green-800"
                        : demande.statut === "refusée"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {demande.statut}
                  </span>
                </p>
                <button
                  onClick={() => handleTelechargerPDF(demande)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                >
                  Télécharger la demande
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
