// src/components/TaskCard.jsx 

// Dictionnaire des couleurs de priorité converti avec les classes Tailwind CSS (Bordure, fonds, texte)
const PRIORITY_COLORS = { 
  high:   { bg: 'bg-red-50/90', border: 'border-red-500', text: 'text-red-700', label: '🔴 Haute' }, 
  medium: { bg: 'bg-amber-50/90', border: 'border-amber-500', text: 'text-amber-700', label: '🟡 Moyenne' }, 
  low:    { bg: 'bg-emerald-50/90', border: 'border-emerald-500', text: 'text-emerald-700', label: '🟢 Basse' }, 
};

// Dictionnaire des statuts converti avec les classes Tailwind CSS
const STATUS_LABELS = { 
  todo:        { label: '📋 À faire',    color: 'text-slate-600 bg-slate-100' }, 
  in_progress: { label: '⚙ En cours',   color: 'text-blue-600 bg-blue-50' }, 
  review:      { label: '👀 Validation', color: 'text-amber-600 bg-amber-50' }, 
  done:        { label: '✅ Terminée',   color: 'text-emerald-600 bg-emerald-50' }, 
};

export default function TaskCard({ task, onDelete }) { 
  // Récupération ou repli par défaut pour les configurations visuelles
  const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low; 
  const status   = STATUS_LABELS[task.status]     || STATUS_LABELS.todo; 

  // Formater proprement la date d'échéance reçue
  const dueLabel = task.due_date 
    ? new Date(task.due_date).toLocaleDateString('fr-FR', { 
        day: '2-digit', month: 'short', year: 'numeric' 
      }) 
    : null;

  // Calcul booléen pour évaluer si le ticket est hors-délais (et pas encore terminé)
  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'done'; 

  // Prise en charge initiale du glisser-déposer (HTML5 Drag & Drop)
  const handleDragStart = (e) => {
    // Stockage crypté/sécurisé de l'identifiant système unique de la tâche
    e.dataTransfer.setData('text/plain', task.id);
  };

  return ( 
    <div 
      // Attributs natifs injectés pour rendre l'interface mécanique et déplaçable
      draggable={true} 
      onDragStart={handleDragStart} 
      
      // Classes Tailwind : Design moderne avec bordure gauche de couleur, coins arrondis, ombres au survol et curseur adapté
      className={`p-4 rounded-xl border-l-4 border-y border-r border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 ${priority.border}`}
    > 
      {/* En-tête de carte : Titre de l'activité + Bouton de suppression croisé */} 
      <div className="flex justify-between items-start gap-3"> 
        <h4 className="font-semibold text-sm text-slate-800 leading-snug"> 
          {task.title} 
        </h4> 
        <button 
          onClick={() => onDelete(task.id)} 
          className="text-slate-400 hover:text-red-500 font-bold transition-colors text-sm p-0.5 rounded-md hover:bg-slate-50"
        > 
          ✕
        </button> 
      </div> 

      {/* Affichage conditionnel de la description (limité à 3 lignes maximum si trop longue) */} 
      {task.description && ( 
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed"> 
          {task.description} 
        </p> 
      )}

      {/* Section basse regroupant les micro-badges d'informations */} 
      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100 items-center"> 
        
        {/* Badge Priorité coloré dynamiquement via Tailwind */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}> 
          {priority.label} 
        </span> 

        {/* Badge de Catégorie personnalisable via la base de données (couleur inline sécurisée) */} 
        {task.categories && ( 
          <span 
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: task.categories.color + '22', 
              color: task.categories.color 
            }}
          > 
            🏷️ {task.categories.name} 
          </span> 
        )} 

        {/* Badge d'échéance : Clignote doucement en rouge (animate-pulse) si la date est dépassée */} 
        {dueLabel && ( 
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
            isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'
          }`}> 
            📅 {isOverdue ? '⚠ En retard ' : ''}{dueLabel} 
          </span> 
        )} 
      </div> 
    </div> 
  );
}