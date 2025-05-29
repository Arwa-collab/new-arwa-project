"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard";
// @ts-ignore
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
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
import { useRouter } from "next/navigation";

// Ajoute ce bloc pour aider TypeScript à reconnaître les méthodes
declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    lastAutoTable?: { finalY: number };
  }
}

interface Demande {
  id: string;
  entite: string;
  date: Timestamp;
  statut: "en attente" | "acceptée" | "refusée";
  nom?: string;
  prenom?: string;
  matricule?: string;
  typeProduit?: string;
  marque?: string;
  modele?: string;
  quantite?: number;
}

export default function MesDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [filteredDemandes, setFilteredDemandes] = useState<Demande[]>([]);
  const [statutFilter, setStatutFilter] = useState("tous");
  const [loading, setLoading] = useState(true);
  const [userMatricule, setUserMatricule] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          const userData = userDocSnap.data();
          const matricule = userData?.matricule;

          // Vérifie le rôle ici
          if (userData?.role !== "responsable" && userData?.role !== "employe") {
            router.push("/dashboard");
            return;
          }

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
          })) as any[];

          setDemandes(data);
          setFilteredDemandes(data);
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
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

    // Titre encadré et centré
    doc.setDrawColor(44, 130, 201);
    doc.setLineWidth(1);
    doc.rect(15, 12, 180, 16, "S");
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Fiche de Demande de Fourniture", 105, 22, { align: "center" } as any);

    // Infos générales
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    let y = 38;
    doc.text(`ID de la demande :`, 20, y);
    doc.text(`${demande.id}`, 65, y);
    y += 8;
    doc.text(`Entité :`, 20, y);
    doc.text(`${demande.entite}`, 65, y);
    y += 8;
    const formattedDate = demande.date?.toDate ? demande.date.toDate().toLocaleDateString('fr-FR') : 'N/A';
    doc.text(`Date de la demande :`, 20, y);
    doc.text(`${formattedDate}`, 65, y);
    y += 8;
    doc.text(`Statut :`, 20, y);
    doc.text(`${demande.statut.charAt(0).toUpperCase() + demande.statut.slice(1)}`, 65, y);
    y += 8;
    if (demande.nom && demande.prenom) {
      doc.text(`Demandeur :`, 20, y);
      doc.text(`${demande.prenom} ${demande.nom} (${demande.matricule || 'N/A'})`, 65, y);
      y += 8;
    }

    // Ligne de séparation
    y += 4;
    doc.setDrawColor(180);
    doc.line(20, y, 190, y);
    y += 10;

    // Détail de la demande sous forme de tableau
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Détail de la demande :", 20, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    autoTable(doc, {
      startY: y,
      head: [["Produit", "Marque", "Modèle", "Quantité"]],
      body: [[
        demande.typeProduit || "",
        demande.marque || "",
        demande.modele || "",
        demande.quantite?.toString() || ""
      ]],
      theme: "grid",
      headStyles: { fillColor: [44, 130, 201], textColor: 255, halign: "center" },
      bodyStyles: { halign: "center" },
      styles: { font: "helvetica", fontSize: 12 },
      margin: { left: 20, right: 20 }
    });

    // Signatures
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : y + 30;
    doc.setFontSize(11);
    doc.text("Signature de l'employé :", 20, finalY);
    doc.text("Signature du responsable :", 120, finalY);

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 285, { align: 'center' });

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
              <BreadcrumbPage className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <ListChecks className="h-4 w-4" />
                Mes Demandes
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

// ...après import autoTable...
(jsPDF as any).autoTable = autoTable;