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
  nomProduit: string;
  quantite: number;
  modele?: string;
  role?: string; // <-- Ajoute ceci
}

export default function NouvelleDemandePage() {
  const [entite, setEntite] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [matricule, setMatricule] = useState("");
  
  const [quantite, setQuantite] = useState<number | string>("");
  const [typeProduit, setTypeProduit] = useState("");
  const [marque, setMarque] = useState("");
  const [modele, setModele] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData(data);
            setNom(data.nom || "");
            setPrenom(data.prenom || "");
            setMatricule(data.matricule || "");
            
            setQuantite(data.quantite || "");
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

    if (!entite || !nom || !prenom || !matricule || !typeProduit || !marque || !quantite) {
      toast.error("Veuillez remplir tous les champs requis.");
      return;
    }

    const dateActuelle = new Date().toISOString().split("T")[0];

    try {
      await addDoc(collection(db, "demandes"), {
        typeProduit: typeProduit.trim().toUpperCase(),
        marque: marque.trim().toUpperCase(),
        modele: modele.trim().toUpperCase(),
        quantite,
        nom: nom.trim(),
        prenom: prenom.trim(),
        statut: "en attente",
        date: new Date(),
        createdAt: serverTimestamp(),
        entite,
        demandeurId: matricule,
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

  if (userData?.role !== "responsable" && userData?.role !== "employe") {
    router.push("/dashboard");
    return;
  }

  return (
    <AuthGuard allowedRoles={["employe", "responsable"]}>
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
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    required
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricule">Matricule</Label>
                <Input
                  id="matricule"
                  required
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  list="modele-list"
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
                  list="modele-list"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantite">Quantité</Label>
                <Input
                  id="quantite"
                  required
                  type="number"
                  value={quantite}
                  onChange={(e) => setQuantite(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeProduit">Type de produit</Label>
                <Input
                  id="typeProduit"
                  required
                  value={typeProduit}
                  onChange={(e) => setTypeProduit(e.target.value)}
                  placeholder="Ex: ordinateur, toner..."
                  list="modele-list"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="marque">Marque</Label>
                <Input
                  id="marque"
                  required
                  value={marque}
                  onChange={(e) => setMarque(e.target.value)}
                  placeholder="Ex: Samsung, HP..."
                  list="modele-list"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modele">Modèle</Label>
                <Input
                  id="modele"
                  required
                  value={modele}
                  onChange={(e) => setModele(e.target.value)}
                  placeholder="Ex: SL-4020..."
                  list="modele-list"
                />
              </div>
              <CardFooter className="flex justify-end pt-6">
                <Button type="submit" disabled={!nom || !prenom || !matricule || !entite || !typeProduit || !marque || !quantite} className="px-8 py-3 text-lg">
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
