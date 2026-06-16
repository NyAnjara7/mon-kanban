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

    // supabase.auth.updateUser détecte automatiquement le token 
    // dans l'URL généré par le lien de récupération.
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('🎉 Mot de passe mis à jour ! Redirection...');
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
        </div>

        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">⚠️ {error}</div>}
        {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-100">{success}</div>}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <input
            type="password"
            placeholder="Nouveau mot de passe"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A8C82] text-white py-3 rounded-xl font-bold"
          >
            {loading ? '...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}