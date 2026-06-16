// src/components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  const location = useLocation(); // Identifie l'URL courante pour l'état actif

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  // Fonction utilitaire : génère dynamiquement les classes Tailwind selon l'onglet actif
  function linkClass(path) {
    const isActive = location.pathname === path;
    return `px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
      isActive 
        ? 'font-bold bg-white/20 text-white shadow-sm' 
        : 'font-normal text-teal-50 hover:bg-white/10 hover:text-white'
    }`;
  }

  return (
    <nav className="bg-[#1A8C82] px-6 flex items-center justify-between h-16 shadow-md sticky top-0 z-50">
      {/* Logo / Nom de l'application */}
      <div className="flex items-center gap-2">
        <span className="text-white font-extrabold text-lg tracking-wider">
          KanbanRT
        </span>
        <span className="bg-white/20 text-white text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">
          Live
        </span>
      </div>

      {/* Liens de navigation centraux */}
      <div className="flex items-center gap-2">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          Tableau de bord
        </Link>

        <Link to="/profile" className={linkClass('/profile')}>
          Mon profil
        </Link>
      </div>

      {/* Informations de l'utilisateur connecté + Bouton déconnexion */}
      <div className="flex items-center gap-4">
        <span className="hidden sm:inline text-white/80 text-xs font-medium max-w-[180px] truncate">
          {session?.user?.email}
        </span>

        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-lg px-4 py-2 transition-all duration-200 shadow-sm active:scale-95"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
}