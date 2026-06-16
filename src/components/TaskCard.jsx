// src/components/TaskCard.jsx
import TaskComments from './TaskComments';

// Dictionnaire des couleurs de priorité converti avec les classes Tailwind CSS
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
  const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low; 
  const status   = STATUS_LABELS[task.status]    || STATUS_LABELS.todo; 

  // Formater proprement la date d'échéance reçue
  const dueLabel = task.due_date 
    ? new Date(task.due_date).toLocaleDateString('fr-FR', { 
        day: '2-digit', month: 'short', year: 'numeric' 
      }) 
    : null;

  // Calcul booléen pour évaluer si le ticket est hors-délais
  const isOverdue = task.due_date && 
    new Date(task.due_date) < new Date() && 
    task.status !== 'done'; 

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  return ( 
    <div 
      draggable={true} 
      onDragStart={handleDragStart} 
      className={`p-4 rounded-xl border-l-4 border-y border-r border-slate-200 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 ${priority.border}`}
    > 
      {/* En-tête de carte */} 
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

      {/* Description */} 
      {task.description && ( 
        <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed"> 
          {task.description} 
        </p> 
      )}

      {/* Section badges */} 
      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100 items-center"> 
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}> 
          {priority.label} 
        </span> 

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

        {dueLabel && ( 
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
            isOverdue ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-600'
          }`}> 
            📅 {isOverdue ? '⚠ En retard ' : ''}{dueLabel} 
          </span> 
        )} 
      </div>

      {/* Section Commentaires */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <TaskComments taskId={task.id} />
      </div>
    </div> 
  );
}