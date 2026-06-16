// src/pages/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import UserTable from '../components/UserTable';
import TaskList from '../components/TaskList'; 
import Navbar from '../components/Navbar'; 

export default function DashboardPage({ session }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks');
  const [boardId, setBoardId] = useState(null);

  // Fonction de chargement des profils d'utilisateurs
  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setUsers(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Chargement automatique du premier tableau (board) disponible
  useEffect(() => {
    supabase
      .from('boards')
      .select('id')
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setBoardId(data[0].id);
      });
  }, []);

  // --- TA FONCTION AJOUTÉE TELLE QUELLE ---
  async function sendEmail() { 
    const response = await fetch('/api/send-email', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ 
        to: ['destinataire@exemple.com'], 
        subject: '📋 Nouvelle tâche KanbanRT', 
        html: ` 
          Nouvelle tâche assignée !
   
          La tâche Configurer Supabase vous a été 
  assignée.
   
          Statut : À faire · Priorité : Haute
   
          Voir le tableau → 
        ` 
      }), 
    }); 
    const result = await response.json(); 
    if (result.success) { 
      console.log('E-mail envoyé ! ID :', result.id); 
    } else { 
      console.error('Erreur :', result.error); 
    } 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Barre de navigation globale */}
      <Navbar session={session} /> 

      {/* Conteneur principal centré et limité en largeur */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Barre d'onglets de navigation interne */}
        <div className="flex gap-2 p-1 bg-slate-200/70 rounded-xl w-fit shadow-inner">
          {[
            ['tasks', '🗂 Tâches'],
            ['users', '👥 Utilisateurs']
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                tab === key 
                  ? 'bg-[#1A8C82] text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/40'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vue conditionnelle : Onglet Tâches */}
        {tab === 'tasks' && (
          boardId ? (
            /* MODIFICATION ICI : Transmission de la session à TaskList */
            <TaskList boardId={boardId} session={session} />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-md mx-auto">
              <span className="text-3xl">📋</span>
              <h3 className="mt-4 font-bold text-slate-800">Aucun tableau détecté</h3>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Veuillez instancier une ligne dans la table <code className="bg-slate-100 text-pink-600 px-1 py-0.5 rounded text-[11px]">boards</code> via le SQL Editor de Supabase pour initialiser l'espace.
              </p>
            </div>
          )
        )}

        {/* Vue conditionnelle : Onglet Utilisateurs */}
        {tab === 'users' && (
          loading ? (
            <div className="text-center py-12 text-slate-500 font-medium animate-pulse">
              Chargement des profils en cours...
            </div>
          ) : (
            <UserTable users={users} onRefresh={fetchUsers} />
          )
        )}

      </main>
    </div>
  );
}