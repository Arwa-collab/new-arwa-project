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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6">
      {/* Header avec logo/titre de l'organisation */}
      <div className="w-full max-w-md mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4 text-center">
          <div className="text-blue-600 font-semibold text-sm">
            المكتب الوطني للكهرباء والماء الصالح للشرب
          </div>
          <div className="text-blue-600 font-medium text-xs">
            Office National de l'Électricité et de l'Eau Potable
          </div>
          <div className="text-blue-700 font-bold text-right mt-1">
            Branche Eau
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl bg-white border-blue-200">
        <CardHeader className="text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="mx-auto mb-4">
            <UserPlus size={48} className="text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-white">Créer un compte</CardTitle>
          <CardDescription className="text-blue-100">
            Rejoignez notre plateforme en remplissant le formulaire ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nom" className="text-blue-700 font-medium">Nom</Label>
                <Input 
                  id="nom" 
                  name="nom" 
                  placeholder="Doe" 
                  onChange={handleChange} 
                  value={formData.nom} 
                  required 
                  disabled={isLoading}
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prenom" className="text-blue-700 font-medium">Prénom</Label>
                <Input 
                  id="prenom" 
                  name="prenom" 
                  placeholder="John" 
                  onChange={handleChange} 
                  value={formData.prenom} 
                  required 
                  disabled={isLoading}
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="matricule" className="text-blue-700 font-medium">Matricule</Label>
              <Input 
                id="matricule" 
                name="matricule" 
                placeholder="E12345" 
                onChange={handleChange} 
                value={formData.matricule} 
                required 
                disabled={isLoading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="entite" className="text-blue-700 font-medium">Entité (Optionnel)</Label>
              <Input 
                id="entite" 
                name="entite" 
                placeholder="Département RH" 
                onChange={handleChange} 
                value={formData.entite} 
                disabled={isLoading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="identifiant" className="text-blue-700 font-medium">Identifiant</Label>
              <Input 
                id="identifiant" 
                type="text" 
                name="identifiant" 
                placeholder="QFatima" 
                onChange={handleChange} 
                value={formData.identifiant} 
                required 
                disabled={isLoading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-blue-700 font-medium">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                name="password" 
                placeholder="••••••••" 
                onChange={handleChange} 
                value={formData.password} 
                required 
                disabled={isLoading}
                className="border-blue-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full py-3 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors" 
              disabled={isLoading}
            > 
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
        <CardFooter className="flex flex-col items-center space-y-2 pt-6 bg-gray-50 rounded-b-lg">
          <p className="text-sm text-gray-600">
            Déjà un compte ?
          </p>
          <Button variant="link" asChild className="p-0 h-auto text-blue-600 hover:text-blue-800">
            <Link href="/login">Se connecter →</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}