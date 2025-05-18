"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const goToEmployeePage = () => {
    router.push("/dashboard"); // Adaptez le chemin selon votre structure
  };

  const goToResponsablePage = () => {
    router.push("/mes-demande"); // Adaptez le chemin selon votre structure
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h1 className="mb-8 text-3xl font-bold text-center text-gray-800">
          Bienvenue dans votre application
        </h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-6 text-center bg-blue-50 rounded-lg">
            <h2 className="mb-4 text-xl font-semibold text-blue-700">Espace Employé</h2>
            <p className="mb-6 text-gray-600">
              Accédez à votre tableau de bord et gérez vos demandes
            </p>
            <button 
              onClick={goToEmployeePage}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Espace Employé
            </button>
          </div>
          
          <div className="p-6 text-center bg-green-50 rounded-lg">
            <h2 className="mb-4 text-xl font-semibold text-green-700">Espace Responsable</h2>
            <p className="mb-6 text-gray-600">
              Gérez les demandes et accédez aux fonctionnalités administratives
            </p>
            <button 
              onClick={goToResponsablePage}
              className="px-6 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Espace Responsable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}