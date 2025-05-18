'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import Link from 'next/link';
import Statistiques from '@/components/Statistiques';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRole = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        router.push('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      if (userData) {
        setRole(userData.role);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [router]);

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;

  return (
    <div className="flex flex-col items-center mt-20 gap-6">
      <h1 className="text-3xl font-bold">Bienvenue dans le Dashboard !</h1>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {role === 'employe' && (
          <>
            <Link
              href="/nouvelle-demande"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-center"
            >
              Faire une demande
            </Link>
            <Link
              href="/mes-demandes"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-center"
            >
              Voir mes demandes
            </Link>
          </>
        )}

        {role === 'responsable' && (
          <>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 text-center"
            >
              Gérer les produits
            </Link>
            <Link
              href="/demandes"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 text-center"
            >
              Voir les demandes
            </Link>
            <Link
              href="/historique"
              className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 text-center"
            >
              🕓 Historique des demandes
            </Link>
            <Link
              href="/users"
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 text-center"
            >
              Gérer les utilisateurs
            </Link>
            <Statistiques />
          </>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 mt-8"
      >
        Se déconnecter
      </button>
    </div>
  );
}
