// src/pages/UpdatePasswordPage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function UpdatePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Mettre à jour le mot de passe de l'utilisateur actuellement connecté (via le lien du mail)
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('🎉 Mot de passe mis à jour avec succès ! Redirection...');
      // Attendre 2 secondes et rediriger vers le tableau de bord
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#1A8C82] tracking-tight">🔒 Nouveau mot de passe</h1>
          <p className="text-xs text-slate-400 mt-1">Saisissez votre nouveau mot de passe sécurisé</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100">
            {success}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A8C82]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A8C82] hover:bg-[#146e66] disabled:bg-slate-300 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md flex justify-center items-center cursor-pointer"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Enregistrer le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}