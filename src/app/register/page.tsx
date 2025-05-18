// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // ⚠️ Assure-toi d'avoir exporté db dans firebase/index.ts
import { collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    matricule: "",
    entite: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // ✅ Enregistrer les infos supplémentaires dans Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        nom: formData.nom,
        prenom: formData.prenom,
        matricule: formData.matricule,
        entite: formData.entite,
        email: formData.email,
        role: "employe" // Par défaut employé, modifiable plus tard par un admin
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-3">
        <input type="text" name="nom" placeholder="Nom" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="prenom" placeholder="Prénom" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="matricule" placeholder="Matricule" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="text" name="entite" placeholder="Entité" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Adresse email" className="w-full p-2 border rounded" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Mot de passe" className="w-full p-2 border rounded" onChange={handleChange} required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          S'inscrire
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  );
}
