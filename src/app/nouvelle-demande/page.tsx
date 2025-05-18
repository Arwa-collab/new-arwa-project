'use client';

import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard";
import { toast } from "react-hot-toast";

export default function NouvelleDemandePage() {
  const [entite, setEntite] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entite || !userData) return;

    const dateActuelle = new Date().toISOString().split("T")[0];

    await addDoc(collection(db, "demandes"), {
      nom: userData.nom,
      prenom: userData.prenom,
      matricule: userData.matricule,
      entite,
      demandeurId: userData.matricule,
      date: dateActuelle,
      createdAt: serverTimestamp(),
      statut: "en attente",
    });

    toast.success("Demande envoyée avec succès !");
    router.push("/mes-demandes");
  };

  if (loading) return <p className="p-4">Chargement...</p>;

  return (
    <AuthGuard allowedRoles={["employe"]}>
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Faire une nouvelle demande</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Nom</label>
            <input
              disabled
              value={userData?.nom || ""}
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Prénom</label>
            <input
              disabled
              value={userData?.prenom || ""}
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Matricule</label>
            <input
              disabled
              value={userData?.matricule || ""}
              className="w-full border px-3 py-2 rounded bg-gray-100"
            />
          </div>
          <div>
            <label className="block font-medium">Entité</label>
            <input
              required
              value={entite}
              onChange={(e) => setEntite(e.target.value)}
              className="w-full border px-3 py-2 rounded"
              placeholder="Ex: RH, Technique, Logistique..."
            />
          </div>
          <button
            type="submit"
            disabled={!userData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Envoyer la demande
          </button>
        </form>
      </div>
    </AuthGuard>
  );
}
