// src/components/TaskList.jsx 
import { useState, useEffect } from 'react'; 
import { supabase } from '../lib/supabase'; 
import TaskCard from './TaskCard'; 
import TaskForm from './TaskForm'; 

export default function TaskList({ boardId }) { 
  // 1. Vos états d'origine et vos filtres (Conservés !)
  const [tasks, setTasks]   = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [search, setSearch] = useState(''); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [filterPriority, setFilterPriority] = useState('all'); 

  // Fonction qui télécharge les tâches depuis Supabase
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

  // ==========================================
  // AJOUT AJUSTÉ : LE HOOK REALTIME (Étape 2)
  // ==========================================
  useEffect(() => {
    // On charge les tâches une première fois au démarrage
    fetchTasks();

    // On s'abonne aux changements en direct de la table 'tasks'
    const channel = supabase
      .channel('tasks-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `board_id=eq.${boardId}` },
        (payload) => {
          console.log('Changement détecté en temps réel !', payload);
          fetchTasks(); // Se recharge tout seul dès qu'une tâche bouge, s'ajoute ou se supprime
        }
      )
      .subscribe();

    // Nettoyage de la connexion quand on quitte le composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId]); 

  // Fonction de suppression (Le Realtime rafraîchira l'écran automatiquement)
  async function handleDelete(taskId) { 
    if (!confirm('Supprimer cette tâche ?')) return; 
    await supabase.from('tasks').delete().eq('id', taskId); 
  }

  // ==========================================
  // AJOUT AJUSTÉ : GESTION DU DROP (Étape 3)
  // ==========================================
  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain'); // Récupère l'ID de la carte glissée
    if (!taskId) return;

    // Met à jour le statut de la tâche déplacée dans la Base de Données
    await supabase
      .from('tasks')
      .update({ status: targetStatus })
      .eq('id', taskId);
  };

  const allowDrop = (e) => {
    e.preventDefault(); // Obligatoire en HTML5 pour autoriser le dépôt
  };

  // Vos filtres en mémoire (Conservés !)
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                          (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Définition des 4 colonnes physiques du tableau Kanban
  const COLUMNS = [
    { id: 'todo', title: '📋 À faire', bg: '#F1F5F9' },
    { id: 'in_progress', title: '⚙ En cours', bg: '#FEF3C7' },
    { id: 'review', title: '👀 Validation', bg: '#EFF6FF' },
    { id: 'done', title: '✅ Terminée', bg: '#ECFDF5' }
  ];

  if (loading) return <p>Chargement des tâches...</p>; 

  return ( 
    <div> 
      <TaskForm boardId={boardId} onCreated={fetchTasks} /> 

      {/* Le bloc visuel de vos filtres (Conservé !) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0' }}>
        <input 
          type="text" 
          placeholder="🔍 Rechercher une tâche..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #CBD5E1', flex: 1 }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #CBD5E1' }}>
          <option value="all">📋 Tous les statuts</option>
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="review">Validation</option>
          <option value="done">Terminée</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #CBD5E1' }}>
          <option value="all">🔥 Toutes les priorités</option>
          <option value="low">🟢 Basse</option>
          <option value="medium">🟡 Moyenne</option>
          <option value="high">🔴 Haute</option>
        </select>
      </div>

      {/* ==========================================
          MODIFICATION : STRUCTURE EN 4 COLONNES KANBAN (Étape 3)
          ========================================== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', alignItems: 'start' }}> 
        {COLUMNS.map(col => {
          // On trie les tâches filtrées pour ne garder que celles de cette colonne spécifique
          const columnTasks = filteredTasks.filter(t => t.status === col.id);

          return (
            <div 
              key={col.id}
              onDragOver={allowDrop} // Autorise le survol de la souris
              onDrop={(e) => handleDrop(e, col.id)} // Déclenche l'enregistrement en BDD au lâcher
              style={{ backgroundColor: col.bg, padding: '1rem', borderRadius: '0.75rem', minHeight: '400px', border: '1px dashed #CBD5E1' }}
            >
              <h3 style={{ fontWeight: 'bold', color: '#334155', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {col.title} ({columnTasks.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {columnTasks.map(task => ( 
                  <TaskCard key={task.id} task={task} onDelete={handleDelete} /> 
                ))} 
              </div>
            </div>
          );
        })}
      </div> 

      {filteredTasks.length === 0 && ( 
        <p style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}> 
          Aucune tâche ne correspond à vos critères.
        </p>
      )} 
    </div> 
  ); 
}