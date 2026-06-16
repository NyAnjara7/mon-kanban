// src/components/UserTable.jsx 
import { useState } from 'react'; 
import { supabase } from '../lib/supabase'; 

export default function UserTable({ users, onRefresh }) { 
  const [newEmail, setNewEmail] = useState(''); 
  const [newName, setNewName]   = useState(''); 
  const [loading, setLoading]   = useState(false); 
  const [error, setError]       = useState(''); 

  async function handleCreate(e) { 
    e.preventDefault(); 
    setError(''); 
    setLoading(true); 
    const { error } = await supabase 
      .from('profiles') 
      .insert([{ email: newEmail, full_name: newName, role: 'member' }]); 
    if (error) { 
      setError(error.message); 
    } else { 
      setNewEmail(''); 
      setNewName(''); 
      onRefresh(); 
    } 
    setLoading(false); 
  } 

  async function handleDelete(id) { 
    if (!confirm('Supprimer cet utilisateur ?')) return; 
    await supabase.from('profiles').delete().eq('id', id); 
    onRefresh(); 
  } 

  return ( 
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6"> 
      
      {/* Formulaire d'ajout d'un profil membre */} 
      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 items-end"> 
        <div className="w-full sm:flex-1">
          <input 
            type="email"
            placeholder="Adresse e-mail *" 
            value={newEmail} 
            onChange={e => setNewEmail(e.target.value)} 
            required 
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] transition-all" 
          /> 
        </div>
        <div className="w-full sm:flex-1">
          <input 
            type="text"
            placeholder="Nom complet" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] transition-all" 
          /> 
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full sm:w-auto bg-[#1A8C82] hover:bg-[#146e66] disabled:bg-slate-300 text-white text-sm font-semibold px-5 py-2 rounded-lg h-[38px] transition-all flex items-center justify-center shadow-sm"
        > 
          {loading ? '...' : '+ Ajouter'} 
        </button> 
      </form> 
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
          ⚠️ {error}
        </div>
      )} 

      {/* Enveloppe responsive pour le débordement horizontal des tableaux sur mobile */} 
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner">
        <table className="w-full border-collapse bg-white text-left text-sm text-slate-600"> 
          <thead> 
            <tr className="bg-[#1A8C82] text-white text-xs uppercase tracking-wider font-semibold"> 
              <th className="px-4 py-3">Email</th> 
              <th className="px-4 py-3">Nom</th> 
              <th className="px-4 py-3">Rôle</th> 
              <th className="px-4 py-3">Créé le</th> 
              <th className="px-4 py-3 text-center">Actions</th> 
            </tr> 
          </thead> 
          <tbody className="divide-y divide-slate-100"> 
            {users.map((u, i) => ( 
              <tr key={u.id} className={`hover:bg-slate-50/80 transition-colors ${i % 2 === 0 ? 'bg-slate-50/40' : 'bg-white'}`}> 
                <td className="px-4 py-3.5 font-medium text-slate-900">{u.email}</td> 
                <td className="px-4 py-3.5 text-slate-500">{u.full_name || '—'}</td> 
                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700 border border-teal-200">
                    {u.role}
                  </span>
                </td> 
                <td className="px-4 py-3.5 text-slate-400 text-xs">
                  {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </td> 
                <td className="px-4 py-3.5 text-center"> 
                  <button 
                    onClick={() => handleDelete(u.id)} 
                    className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  > 
                    Supprimer 
                  </button> 
                </td> 
              </tr> 
            ))} 
          </tbody> 
        </table> 
      </div>

      {users.length === 0 && (
        <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-slate-400 text-sm font-medium">Aucun utilisateur pour l'instant.</p>
        </div>
      )} 
    </div> 
  ); 
}