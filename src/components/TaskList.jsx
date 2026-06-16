// src/components/TaskList.jsx 
import { useState, useEffect } from 'react'; 
import { supabase } from '../lib/supabase'; 
import TaskCard from './TaskCard'; 
import TaskForm from './TaskForm'; 

export default function TaskList({ boardId }) { 
  // États d'origine pour stocker les données et le chargement
  const [tasks, setTasks]   = useState([]); 
  const [loading, setLoading] = useState(true); 

  // États nécessaires pour la fonctionnalité "Filtres et recherche"
  const [search, setSearch] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [filterPriority, setFilterPriority] = useState('all'); 

  // Récupération initiale des tâches depuis Supabase
  async function fetchTasks() { 
    setLoading(true); 
    const { data, error } = await supabase 
      .from('tasks') 
      .select('*, categories(*)')   
      .eq('board_id', boardId) 
      .order('created_at', { ascending: false }); 
    if (!error) setTasks(data || []); 
    setLoading(false); 
  }

  // Hook gérant la synchronisation en Temps Réel (Realtime Supabase)
  useEffect(() => {
    fetchTasks();

    // Inscription au canal de diffusion en direct pour intercepter les mises à jour
    const channel = supabase
      .channel('tasks-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `board_id=eq.${boardId}` },
        (payload) => {
          // Si une tâche change (déplacement, création, suppression), on rafraîchit localement
          fetchTasks(); 
        }
      )
      .subscribe();

    // Fermeture propre du canal réseau si le composant est démonté
    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]); 

  // Demande de suppression (le rafraîchissement écran est géré par l'écouteur temps réel)
  async function handleDelete(taskId) { 
    if (!confirm('Supprimer cette tâche ?')) return; 
    await supabase.from('tasks').delete().eq('id', taskId); 
  }

  // Événement déclenché lorsqu'une carte est relâchée (Drag & Drop)
  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain'); // Récupération de l'identifiant transféré
    if (!taskId) return;

    // Envoi de la modification du statut directement en base de données
    await supabase
      .from('tasks')
      .update({ status: targetStatus })
      .eq('id', taskId);
  };

  // Nécessaire pour autoriser le curseur à survoler et déposer des éléments
  const allowDrop = (e) => {
    e.preventDefault(); 
  };

  // Filtrage combiné (Recherche + Statut + Priorité) calculé à la volée en mémoire
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Définition de la configuration stylisée Tailwind pour les 4 colonnes Kanban physiques
  const COLUMNS = [
    { id: 'todo', title: '📋 À faire', bg: 'bg-slate-50 border-slate-200' },
    { id: 'in_progress', title: '⚙ En cours', bg: 'bg-amber-50/60 border-amber-200' },
    { id: 'review', title: '👀 Validation', bg: 'bg-blue-50/60 border-blue-200' },
    { id: 'done', title: '✅ Terminée', bg: 'bg-emerald-50/50 border-emerald-200' }
  ];

  // Affichage d'attente animé pendant le premier chargement
  if (loading) return <p className="text-center text-slate-500 font-medium py-10 animate-pulse">Chargement des tâches...</p>; 

  return ( 
    <div className="space-y-6 max-w-7xl mx-auto px-4"> 
      
      {/* Conteneur de formulaire stylisé blanc */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <TaskForm boardId={boardId} onCreated={fetchTasks} /> 
      </div>

      {/* Barre de Recherche et Filtres réactive (Tailwind CSS) */}
      <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Champ de recherche textuelle libre */}
        <div className="relative w-full md:w-1/2">
          <input 
            type="text" 
            placeholder="Rechercher une tâche..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-4 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-all"
          />
        </div>
        
        {/* Sélecteurs de filtres */}
        <div className="flex gap-2 w-full md:w-auto">
          {/* Filtre par Statut */}
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="w-full md:w-auto px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">📋 Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="in_progress">En cours</option>
            <option value="review">Validation</option>
            <option value="done">Terminée</option>
          </select>
          
          {/* Filtre par Priorité */}
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)} 
            className="w-full md:w-auto px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">🔥 Toutes les priorités</option>
            <option value="low">🟢 Basse</option>
            <option value="medium">🟡 Moyenne</option>
            <option value="high">🔴 Haute</option>
          </select>
        </div>
      </div>

      {/* Grille adaptative (1 colonne mobile, 2 colonnes tablette, 4 colonnes ordinateurs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start"> 
        {COLUMNS.map(col => {
          // Extraction exclusive des tâches affectées à cette colonne précise
          const columnTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id}
              onDragOver={allowDrop} // Écouteur obligatoire HTML5 pour survol
              onDrop={(e) => handleDrop(e, col.id)} // Déclenchement de la mise à jour bdd au drop
              className={`rounded-2xl p-4 min-h-[500px] border border-solid shadow-sm transition-all duration-200 ${col.bg}`}
            >
              {/* En-tête de la colonne avec compteur numérique */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200/60">
                <h3 className="font-bold text-slate-700 text-sm tracking-wide">
                  {col.title}
                </h3>
                <span className="bg-white text-slate-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 shadow-sm">
                  {columnTasks.length}
                </span>
              </div>

              {/* Conteneur d'empilement vertical des cartes */}
              <div className="flex flex-col gap-3">
                {columnTasks.map(task => ( 
                  <TaskCard key={task.id} task={task} onDelete={handleDelete} /> 
                ))} 
                
                {/* Zone de drop vide indicative si aucune tâche n'est présente */}
                {columnTasks.length === 0 && (
                  <div className="text-center text-xs text-slate-400 font-medium py-10 border border-dashed border-slate-300 rounded-xl bg-white/40">
                    Déposez une carte ici
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div> 

      {/* Message d'absence globale de résultats */}
      {filteredTasks.length === 0 && ( 
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100 shadow-sm">
          <p className="text-slate-400 font-medium">Aucune tâche ne correspond à vos critères. 🚀</p>
        </div>
      )} 
    </div> 
  ); 
}