import React from 'react';
import { Inter } from 'next/font/google';
import Link from 'next/link';


const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={`${inter.className} flex flex-col items-center justify-center min-h-screen p-4`}>
      <h1 className="text-4xl font-bold mb-4">Bienvenue dans l'application de gestion des demandes</h1>
      <p className="text-lg mb-4">Cette application vous permet de gérer les demandes de fournitures.</p>
      <Link href="/demandes" className="bg-blue-600 text-white px-4 py-2 rounded">
        Voir les demandes
      </Link>
    </main>
  );
}