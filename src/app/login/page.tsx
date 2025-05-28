// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { LogIn, Loader2, Droplets } from "lucide-react";
import { toast } from "react-hot-toast";
import { FirebaseError } from 'firebase/app';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LoginPage() {
  const [identifiant, setIdentifiant] = useState(""); // Remplace email par identifiant
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!identifiant || !password) {
      toast.error("Veuillez saisir votre identifiant et votre mot de passe.");
      setIsLoading(false);
      return;
    }

    try {
      // Cherche l'utilisateur par identifiant
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("identifiant", "==", identifiant));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Identifiant incorrect.");
        setIsLoading(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();
      // Génère l'email fictif à partir de l'identifiant
      const email = `${userData.identifiant.toLowerCase().trim()}@mondomaine.com`;

      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Connexion réussie ! Redirection...");
      router.push("/dashboard");
    } catch (err) {
      setIsLoading(false);
      const firebaseError = err as FirebaseError;
      if (
        firebaseError.code === "auth/invalid-credential" ||
        firebaseError.code === "auth/user-not-found" ||
        firebaseError.code === "auth/wrong-password"
      ) {
        toast.error("Identifiant ou mot de passe incorrect. Veuillez réessayer.");
      } else {
        toast.error("Une erreur s'est produite lors de la connexion.");
      }
      console.error("Login error: ", firebaseError);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-slate-100 relative overflow-hidden">
      {/* Éléments décoratifs d'eau */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-60 h-60 bg-blue-200/15 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        {/* Header avec logo */}
        <div className="mb-8 text-center">
          <div className="mb-4 p-4 bg-white rounded-2xl shadow-lg inline-block">
            <Image
              src="/icons/logo.png"
              alt="Branche Eau Logo"
              width={400}
              height={400}
              className="object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Branche Eau</h1>
          <p className="text-blue-700 text-lg">Office National de l'Électricité et de l'Eau Potable</p>
        </div>

        {/* Carte de connexion */}
        <Card className="w-full max-w-md shadow-2xl border-blue-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full">
              <LogIn size={32} className="text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-blue-900">Connexion</CardTitle>
            <CardDescription className="text-blue-700 text-base">
              Accédez à votre espace de travail
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="identifiant" className="text-blue-800 font-medium">
                  Identifiant
                </Label>
                <Input
                  id="identifiant"
                  type="text"
                  placeholder="Votre identifiant"
                  value={identifiant}
                  onChange={(e) => setIdentifiant(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-800 font-medium">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 h-12 text-base"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200 hover:shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <Droplets className="mr-2 h-5 w-5" />
                    Se connecter
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col items-center space-y-3 pt-6 border-t border-blue-100">
            <p className="text-sm text-blue-600">
              Pas encore de compte ?
            </p>
            <Button 
              variant="ghost" 
              asChild 
              className="h-auto p-0 text-blue-700 hover:text-blue-800 font-medium hover:bg-transparent"
            >
              <Link href="/register">
                Créer un compte →
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-blue-600 text-sm">
            © 2024 Office National de l'Électricité et de l'Eau Potable
          </p>
          <p className="text-blue-500 text-xs mt-1">
            Branche Eau - Système de Gestion
          </p>
        </div>
      </div>
    </div>
  );
}