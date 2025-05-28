// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    entite: "",
    identifiant: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { nom, prenom, matricule, identifiant, password } = formData;
    if (!nom || !prenom || !matricule || !identifiant || !password) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return false;
    }
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Génère un email fictif à partir de l'identifiant
      const email = `${formData.identifiant.toLowerCase().trim()}@mondomaine.com`;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        formData.password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        matricule: formData.matricule.trim(),
        entite: formData.entite.trim(),
        identifiant: formData.identifiant.trim(), // On stocke l'identifiant
        email: email, // email généré
        role: "employe",
        createdAt: new Date().toISOString(),
      });

      toast.success("Compte créé avec succès ! Redirection...");
      router.push("/dashboard");
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        toast.error("Cet identifiant est déjà utilisé.");
      } else if (err.code === 'auth/weak-password') {
        toast.error("Le mot de passe est trop faible.");
      } else {
        toast.error("Erreur lors de la création du compte. Veuillez réessayer.");
      }
      console.error("Registration error: ", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/40 p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <UserPlus size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Créer un compte</CardTitle>
          <CardDescription className="text-md">
            Rejoignez notre plateforme en remplissant le formulaire ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nom">Nom</Label>
                <Input id="nom" name="nom" placeholder="Doe" onChange={handleChange} value={formData.nom} required disabled={isLoading} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prenom">Prénom</Label>
                <Input id="prenom" name="prenom" placeholder="John" onChange={handleChange} value={formData.prenom} required disabled={isLoading} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="matricule">Matricule</Label>
              <Input id="matricule" name="matricule" placeholder="E12345" onChange={handleChange} value={formData.matricule} required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entite">Entité (Optionnel)</Label>
              <Input id="entite" name="entite" placeholder="Département RH" onChange={handleChange} value={formData.entite} disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="identifiant">identifiant</Label>
              <Input id="identifiant" type="identifiant" name="identifiant" placeholder="QFatima" onChange={handleChange} value={formData.identifiant} required disabled={isLoading} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" name="password" placeholder="********" onChange={handleChange} value={formData.password} required disabled={isLoading} />
            </div>
            
            <Button type="submit" className="w-full py-3 text-lg" disabled={isLoading}> 
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Déjà un compte ?
          </p>
          <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">Se connecter</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
