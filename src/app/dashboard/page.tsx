'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

import { db } from '@/lib/firebase';
import Statistiques from '@/components/Statistiques';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        if (userData) {
          setRole(userData.role);
        }
      } catch (error) {
        console.error("Error fetching user role: ", error);
        // Optionally, handle the error, e.g., redirect to login or show an error message
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [router]);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show an error message to the user
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4 text-lg">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen py-12 px-4">
      <h1 className="text-4xl font-bold mb-10 text-center">Bienvenue dans le Dashboard !</h1>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {role === 'employe' && (
            <>
              <Button asChild className="w-full py-6 text-lg">
                <Link href="/nouvelle-demande">Faire une demande</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full py-6 text-lg">
                <Link href="/mes-demandes">Voir mes demandes</Link>
              </Button>
            </>
          )}

          {role === 'responsable' && (
            <>
              <Button asChild className="w-full py-3">
                <Link href="/products">Gérer les produits</Link>
              </Button>
              <Button asChild variant="secondary" className="w-full py-3">
                <Link href="/demandes">Voir les demandes</Link>
              </Button>
              <Button asChild variant="outline" className="w-full py-3">
                <Link href="/historique">🕓 Historique des demandes</Link>
              </Button>
              <Button asChild variant="outline" className="w-full py-3">
                <Link href="/users">Gérer les utilisateurs</Link>
              </Button>
              <div className="mt-4">
                <Statistiques />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        onClick={handleLogout}
        className="mt-10 py-3 px-8 text-lg"
      >
        Se déconnecter
      </Button>
      </div>
  );
}
