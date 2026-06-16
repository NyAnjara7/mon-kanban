// src/components/TaskForm.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskForm({ boardId, onCreated, session }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Chargement des catégories au montage du composant
  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      setCategories(data || []);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    
    if (!title.trim()) {
      setError('Le titre est obligatoire.');
      return;
    }

    setLoading(true);

    // 1. Insertion de la tâche dans Supabase
    const { data: { user } } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from('tasks').insert([{
      title: title.trim(),
      description: description.trim() || null,
      status,
      priority,
      board_id: boardId,
      category_id: categoryId || null,
      due_date: dueDate || null,
      created_by: user.id,
    }]);

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // 2. Envoi de l'e-mail si une date d'échéance est définie
    if (dueDate && session?.user?.email) {
      const formattedDate = new Date(dueDate).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
      });

      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: [session.user.email],
          subject: `📋 Tâche créée : ${title}`,
          html: `
            <h3>Tâche créée avec succès</h3>
            <p><strong>Titre :</strong> ${title}</p>
            <p><strong>Priorité :</strong> ${priority}</p>
            <p><strong>Échéance :</strong> ${formattedDate}</p>
          `,
        }),
      });
    }

    // 3. Réinitialisation du formulaire et notification au parent
    setTitle('');
    setDescription('');
    setStatus('todo');
    setPriority('medium');
    setCategoryId('');
    setDueDate('');
    setLoading(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
        <h3 className="text-base font-bold text-[#1A8C82]">➕ Nouvelle tâche</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
          ⚠️ {error}
        </div>
      )}

      <div>
        <input
          type="text"
          placeholder="Titre de la tâche *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] transition-all"
        />
      </div>

      <div>
        <textarea
          placeholder="Description détaillée (optionnelle)..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] transition-all resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Statut</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700">
            <option value="todo">📋 À faire</option>
            <option value="in_progress">⚙ En cours</option>
            <option value="review">👀 Validation</option>
            <option value="done">✅ Terminée</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priorité</label>
          <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700">
            <option value="low">🟢 Basse</option>
            <option value="medium">🟡 Moyenne</option>
            <option value="high">🔴 Haute</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Catégorie</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700">
            <option value="">— Aucune —</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Échéance</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700" />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#1A8C82] hover:bg-[#146e66] disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg px-5 py-2.5 transition-all active:scale-95 flex items-center gap-2"
        >
          {loading ? 'Enregistrement...' : 'Créer la tâche'}
        </button>
      </div>
    </form>
  );
}