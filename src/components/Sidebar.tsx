import Link from "next/link";
import Image from "next/image";

export default function Sidebar({ role }: { role: string }) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white flex flex-col shadow-2xl z-10 border-r border-blue-700">
      {/* Header avec logo */}
      <div className="p-6 border-b border-blue-700/50">
        <div className="flex items-center justify-center mb-2">
          {/* Placeholder pour le logo - remplacez par votre logo */}
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <Image 
              src="/icons/logo.png" // Chemin vers votre logo dans le dossier icons
              alt="Logo Entreprise"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-bold text-blue-100">ONEE-BRANCHE EAU</h1>
          <p className="text-xs text-blue-300 uppercase tracking-wider">{role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700/50 transition-all duration-200 group border border-transparent hover:border-blue-600/30"
          >
            <div className="w-5 h-5 bg-blue-400 rounded flex-shrink-0 flex items-center justify-center">
              <span className="text-xs">📊</span>
            </div>
            <span className="font-medium group-hover:text-blue-200">Dashboard</span>
          </Link>

          {role === "responsable" && (
            <>
              <Link 
                href="/users" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700/50 transition-all duration-200 group border border-transparent hover:border-blue-600/30"
              >
                <div className="w-5 h-5 bg-blue-400 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs">👥</span>
                </div>
                <span className="font-medium group-hover:text-blue-200">Utilisateurs</span>
              </Link>
              <Link 
                href="/historique" 
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700/50 transition-all duration-200 group border border-transparent hover:border-blue-600/30"
              >
                <div className="w-5 h-5 bg-blue-400 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-xs">📋</span>
                </div>
                <span className="font-medium group-hover:text-blue-200">Historique</span>
              </Link>
            </>
          )}

          {role === "superviseur" && (
            <Link 
              href="/superviseur/stock" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700/50 transition-all duration-200 group border border-transparent hover:border-blue-600/30"
            >
              <div className="w-5 h-5 bg-blue-400 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs">📦</span>
              </div>
              <span className="font-medium group-hover:text-blue-200">Stock</span>
            </Link>
          )}

          {role === "employe" && (
            <Link 
              href="/employe/mes-demandes" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700/50 transition-all duration-200 group border border-transparent hover:border-blue-600/30"
            >
              <div className="w-5 h-5 bg-blue-400 rounded flex-shrink-0 flex items-center justify-center">
                <span className="text-xs">📝</span>
              </div>
              <span className="font-medium group-hover:text-blue-200">Mes Demandes</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-blue-700/50">
        <div className="text-center text-xs text-blue-300">
          © 2024 Votre Entreprise
        </div>
      </div>
    </aside>
  );
}