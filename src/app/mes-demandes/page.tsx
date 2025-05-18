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
import Link from "next/link"; 
import { Loader2, Home, ListChecks, Download, FileWarning } from "lucide-react"; 
import { Button } from "@/components/ui/button"; 
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription, 
} from "@/components/ui/card"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption, 
} from "@/components/ui/table"; 
import { Badge } from "@/components/ui/badge"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; 
import { Label } from "@/components/ui/label"; 
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"; 

interface Demande {
  id: string;
  entite: string;
  date: Timestamp; 
  statut: "en attente" | "acceptée" | "refusée";
  nom?: string; 
  prenom?: string; 
  matricule?: string; 
}

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [filteredDemandes, setFilteredDemandes] = useState<Demande[]>([]);
  const [statutFilter, setStatutFilter] = useState("tous");
  const [loading, setLoading] = useState(true);
  const [userMatricule, setUserMatricule] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
          const userDocSnap = await getDocs(userQuery);
          const userData = userDocSnap.docs[0]?.data();
          const matricule = userData?.matricule;
          setUserMatricule(matricule);

          if (!matricule) {
            setLoading(false);
            return;
          }

          const q = query(
            collection(db, "demandes"),
            where("demandeurId", "==", matricule),
            orderBy("createdAt", "desc") 
          );
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Demande[];

          setDemandes(data);
          setFilteredDemandes(data); 
        } catch (error) {
          console.error("Error fetching data: ", error);
          // Optionally show a toast error
        }
      } else {
        // Handle user not logged in if necessary, e.g., redirect
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (statutFilter === "tous") {
      setFilteredDemandes(demandes);
    } else {
      setFilteredDemandes(
        demandes.filter((d) => d.statut === statutFilter)
      );
    }
  }, [statutFilter, demandes]);

  const handleTelechargerPDF = (demande: Demande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Fiche de Demande de Fourniture", 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`ID de la demande: ${demande.id}`, 20, 40);
    doc.text(`Entité: ${demande.entite}`, 20, 50);
    const formattedDate = demande.date?.toDate ? demande.date.toDate().toLocaleDateString('fr-FR') : 'N/A';
    doc.text(`Date de la demande: ${formattedDate}`, 20, 60);
    doc.text(`Statut: ${demande.statut.charAt(0).toUpperCase() + demande.statut.slice(1)}`, 20, 70);
    if (demande.nom && demande.prenom) {
      doc.text(`Demandeur: ${demande.prenom} ${demande.nom} (${demande.matricule || 'N/A'})`, 20, 80);
    }

    doc.line(20, 90, 190, 90); 

    doc.text("Articles demandés:", 20, 100);
    doc.text("- Item 1 (Quantité: X)", 25, 110);
    doc.text("- Item 2 (Quantité: Y)", 25, 120);

    doc.line(20, 230, 190, 230); 
    doc.setFontSize(10);
    doc.text("Signature de l'employé: __________________________", 20, 250);
    doc.text("Signature du responsable: ________________________", 100, 250);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 280, { align: 'center'});

    doc.save(`demande-${demande.id}.pdf`);
  };

  const getStatusBadgeVariant = (
    statut: Demande["statut"]
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (statut) {
      case "acceptée":
        return "default"; 
      case "refusée":
        return "destructive";
      case "en attente":
        return "secondary"; 
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4 text-lg">Chargement des demandes...</p>
      </div>
    );
  }

  return (
    <AuthGuard allowedRoles={["employe"]}>
      <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard"><Home className="h-4 w-4" /> Tableau de bord</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                <ListChecks className="h-4 w-4 mr-1.5 inline-block" /> Mes Demandes
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <CardTitle className="text-3xl font-bold">Mes Demandes de Fournitures</CardTitle>
                <CardDescription className="mt-1">
                  Consultez et gérez vos demandes soumises.
                </CardDescription>
              </div>
              <div className="mt-4 sm:mt-0 w-full sm:w-auto max-w-xs">
                <Label htmlFor="statutFilter" className="sr-only">Filtrer par statut</Label>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger id="statutFilter" aria-label="Filtrer par statut">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="en attente">En attente</SelectItem>
                    <SelectItem value="acceptée">Acceptée</SelectItem>
                    <SelectItem value="refusée">Refusée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Entité</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDemandes.length > 0 ? (
                  filteredDemandes.map((demande) => (
                    <TableRow key={demande.id}>
                      <TableCell className="font-medium">{demande.entite}</TableCell>
                      <TableCell>
                        {demande.date?.toDate ? demande.date.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric'}) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(demande.statut)} className="capitalize">
                          {demande.statut}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTelechargerPDF(demande)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <FileWarning className="h-10 w-10 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {statutFilter === 'tous' ? 'Aucune demande trouvée.' : `Aucune demande avec le statut "${statutFilter}".`}
                        </p>
                        {userMatricule && statutFilter === 'tous' && (
                           <Button asChild size="sm" className="mt-2">
                            <Link href="/nouvelle-demande">Créer une nouvelle demande</Link>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {filteredDemandes.length > 0 && (
                <TableCaption>Liste de vos {filteredDemandes.length} dernières demandes.</TableCaption>
              )}
            </Table>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}
