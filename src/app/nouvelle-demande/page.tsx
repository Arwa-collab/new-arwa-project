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
import { Loader2, Home } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; 
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; 
import Link from "next/link"; 

// Added UserData interface
interface UserData {
  nom: string;
  prenom: string;
  matricule: string;
  // Add other user fields if necessary
}

export default function NouvelleDemandePage() {
  const [entite, setEntite] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData);
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          toast.error("Erreur lors de la récupération des informations utilisateur.");
        }
      } else {
        router.push('/login'); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!entite || !userData) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }

    const dateActuelle = new Date().toISOString().split("T")[0];

    try {
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
    } catch (error) {
      console.error("Error submitting form: ", error);
      toast.error("Erreur lors de l'envoi de la demande.");
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
    <AuthGuard allowedRoles={["employe"]}>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        <Breadcrumb className="mb-6 sm:mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                  Tableau de bord
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium text-foreground">
                Nouvelle Demande
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Faire une nouvelle demande</CardTitle>
            <CardDescription className="text-md">
              Veuillez remplir les informations ci-dessous pour soumettre votre demande.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    disabled
                    value={userData?.nom || ""}
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    disabled
                    value={userData?.prenom || ""}
                    className="bg-muted/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule</Label>
                <Input
                  id="matricule"
                  disabled
                  value={userData?.matricule || ""}
                  className="bg-muted/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="entite">Entité</Label>
                <Input
                  id="entite"
                  required
                  value={entite}
                  onChange={(e) => setEntite(e.target.value)}
                  placeholder="Ex: Département RH, Service Technique, Unité Logistique..."
                />
              </div>
              <CardFooter className="flex justify-end pt-6">
                <Button type="submit" disabled={!userData || !entite} className="px-8 py-3 text-lg">
                  Envoyer la demande
                </Button>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
