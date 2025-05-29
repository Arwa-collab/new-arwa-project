'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, FilePlus2, ListChecks, LogOut, Package, Users, History, BarChart3 } from 'lucide-react';
import Sidebar from "@/components/Sidebar";

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
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-blue-700 mt-4 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <Sidebar role={role || ""} />
      
      <main className="flex-1 ml-64">
        {/* Header avec image Branche Eau */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
          <Image
            src="/icons/logo.png" // Votre logo Branche Eau
            alt="Office National de l'Electricité et de l'Eau Potable - Branche Eau"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-blue-900/20"></div>
          <div className="absolute bottom-4 left-8 text-white">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-blue-100 capitalize">Bienvenue, {role}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="absolute top-4 right-6 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Contenu principal */}
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Actions rapides selon le rôle */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Actions Rapides</h2>
              
              {role === 'employe' && (
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <FilePlus2 className="h-5 w-5 mr-2" />
                        Nouvelle Demande
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Créer une nouvelle demande de matériel ou service</p>
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href="/nouvelle-demande">
                          Faire une demande
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <ListChecks className="h-5 w-5 mr-2" />
                        Mes Demandes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Consulter le statut de vos demandes</p>
                      <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Link href="/mes-demandes">
                          Voir mes demandes
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {role === 'responsable' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <Package className="h-5 w-5 mr-2" />
                        Produits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Gérer le catalogue des produits</p>
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href="/products">Gérer les produits</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <ListChecks className="h-5 w-5 mr-2" />
                        Demandes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Traiter les demandes en attente</p>
                      <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Link href="/demandes">Voir les demandes</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <History className="h-5 w-5 mr-2" />
                        Historique
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Consulter l'historique des demandes</p>
                      <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Link href="/historique">Historique</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <Users className="h-5 w-5 mr-2" />
                        Utilisateurs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Gérer les comptes utilisateurs</p>
                      <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Link href="/users">Gérer les utilisateurs</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Carte Mes demandes */}
                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <ListChecks className="h-5 w-5 mr-2" />
                        Mes demandes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Voir les demandes que j'ai effectuées</p>
                      <Button asChild variant="outline" className="w-full border-blue-300 text-blue-700 hover:bg-blue-50">
                        <Link href="/mes-demandes">Mes demandes</Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Carte Nouvelle demande */}
                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-green-800">
                        <FilePlus2 className="h-5 w-5 mr-2" />
                        Nouvelle demande
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Faire une nouvelle demande de fourniture</p>
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <Link href="/nouvelle-demande">Nouvelle demande</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {role === 'superviseur' && (
                <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                  <Card className="hover:shadow-lg transition-shadow border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center text-blue-800">
                        <Package className="h-5 w-5 mr-2" />
                        Stock & Produits
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">Consulter les produits et gérer le stock</p>
                      <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                        <Link href="/superviseur/stock">Consulter le stock</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Statistiques pour responsable */}
            {(role === 'responsable') && (
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-800">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Statistiques />
                </CardContent>
              </Card>
            )}

           
          </div>
        </div>
      </main>
    </div>
  );
}