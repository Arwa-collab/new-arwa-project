'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AuthGuard from '@/components/AuthGuard';
import { format } from 'date-fns';
import Link from "next/link";
import { Home } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function HistoriquePage() {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [date, setDate] = useState(''); // Un seul champ date
  const [filteredDemandes, setFilteredDemandes] = useState<any[]>([]);

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    const snapshot = await getDocs(collection(db, 'demandes'));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDemandes(data);
    setFilteredDemandes(data);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchTerm.toLowerCase().trim();

    const filtered = demandes.filter((d) => {
      const values = [
        d.nom,
        d.prenom,
        d.matricule,
        d.entite,
        d.typeProduit,
        d.marque,
        d.quantite?.toString(),
        d.statut,
        d.date?.toDate ? format(d.date.toDate(), 'dd/MM/yyyy') : '',
      ]
        .map((v) => (v ? v.toString().toLowerCase() : ''))
        .join(' ');

      const matchTerm = values.includes(term);

      // Filtre sur la date exacte si renseignée
      let matchDate = true;
      if (date && d.date?.toDate) {
        matchDate = format(d.date.toDate(), 'yyyy-MM-dd') === date;
      }

      return matchTerm && matchDate;
    });

    setFilteredDemandes(filtered);
  };

  return (
    <AuthGuard allowedRoles={['responsable']}>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
        <Home className="h-4 w-4" />
        Tableau de bord
      </Link>
        <h1 className="text-2xl font-bold mb-6">Historique des demandes</h1>

        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-4 items-center mb-6"
        >
          <input
            type="text"
            placeholder="Rechercher"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-64"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border px-4 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Rechercher
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Nom</th>
                <th className="p-2 border">Prénom</th>
                <th className="p-2 border">Matricule</th>
                <th className="p-2 border">Entité</th>
                <th className="p-2 border">Type produit</th>
                <th className="p-2 border">Marque</th>
                <th className="p-2 border">Quantité</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandes.length > 0 ? (
                filteredDemandes.map((demande) => (
                  <tr key={demande.id}>
                    <td className="p-2 border">{demande.nom}</td>
                    <td className="p-2 border">{demande.prenom}</td>
                    <td className="p-2 border">{demande.matricule}</td>
                    <td className="p-2 border">{demande.entite}</td>
                    <td className="p-2 border">{demande.typeProduit || '-'}</td>
                    <td className="p-2 border">{demande.marque || '-'}</td>
                    <td className="p-2 border">{demande.quantite ?? '-'}</td>
                    <td className="p-2 border">
                      {demande.date?.toDate
                        ? format(demande.date.toDate(), 'dd/MM/yyyy')
                        : 'N/A'}
                    </td>
                    <td className="p-2 border">{demande.statut}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="p-4 text-center">
                    Aucune demande trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AuthGuard>
  );
}
