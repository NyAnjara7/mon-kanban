// src/pages/LoginPage.jsx 
import { useState } from 'react'; 
import { supabase } from '../lib/supabase'; 
 
export default function LoginPage() { 
  const [email, setEmail]       = useState(''); 
  const [password, setPassword] = useState(''); 
  const [isRegister, setIsRegister] = useState(false); 
  const [error, setError]       = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const [loading, setLoading]   = useState(false); 
 
  // --- SOUUMISSION DU FORMULAIRE (CONNEXION / INSCRIPTION) ---
  async function handleSubmit(e) { 
    e.preventDefault(); 
    setError(''); 
    setSuccessMessage('');
    setLoading(true); 
    let result; 
    if (isRegister) { 
      result = await supabase.auth.signUp({ email, password }); 
    } else { 
      result = await supabase.auth.signInWithPassword({ email, password }); 
    } 
    if (result.error) setError(result.error.message); 
    setLoading(false); 
  } 

  // --- FONCTION POUR LE MOT DE PASSE OUBLIÉ ---
  async function handleForgotPassword() {
    setError('');
    setSuccessMessage('');

    if (!email) {
      setError("Veuillez saisir votre adresse e-mail dans le champ ci-dessus pour pouvoir réinitialiser votre mot de passe.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5173/update-password', // L'URL de redirection après le clic sur le mail
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccessMessage("📩 Un e-mail de réinitialisation a été envoyé ! Vérifiez votre boîte de réception.");
    }
    setLoading(false);
  }
 
  return ( 
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-4"> 
      {/* Carte centrale du formulaire */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 space-y-6">
        
        {/* En-tête dynamique */}
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#1A8C82] tracking-tight"> 
            {isRegister ? '📝 Créer un compte' : '🔐 Connexion'} 
          </h1> 
          <p className="text-xs text-slate-400 mt-1">
            {isRegister ? 'Rejoignez la plateforme collaborative' : 'Ravi de vous revoir !'}
          </p>
        </div>

        {/* Alerte d'erreur */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-100 leading-snug">
            ⚠️ {error}
          </div>
        )} 

        {/* Alerte de succès */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-100 leading-snug">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4"> 
          {/* Champ E-mail */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Adresse e-mail</label>
            <input 
              type="email" 
              placeholder="nom@exemple.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] focus:border-[#1A8C82] focus:bg-white transition-all" 
            /> 
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Mot de passe</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required={!isRegister} // Non requis si on veut juste faire "Mot de passe oublié"
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] focus:border-[#1A8C82] focus:bg-white transition-all" 
            /> 
            
            {/* Affichage conditionnel des indications sous le mot de passe */}
            {isRegister ? (
              <span className="text-[10px] text-slate-400 mt-1 block">6 caractères minimum requis.</span>
            ) : (
              <div className="text-right mt-1.5">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="text-[11px] font-bold text-[#1A8C82] hover:text-[#146e66] transition-colors hover:underline focus:outline-none disabled:text-slate-400 cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}
          </div>

          {/* Bouton de soumission */}
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full mt-2 bg-[#1A8C82] hover:bg-[#146e66] disabled:bg-slate-300 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-teal-900/10 active:scale-[0.98] cursor-pointer flex justify-center items-center"
          > 
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isRegister ? 'Créer le compte' : 'Se connecter'} 
          </button> 
        </form> 

        {/* Lien de bascule d'état (Login / Register) */}
        <div className="text-center pt-2">
          <p 
            className="text-xs font-semibold text-[#1A8C82] hover:text-[#146e66] transition-colors cursor-pointer inline-block underline underline-offset-4" 
            onClick={() => { setError(''); setSuccessMessage(''); setIsRegister(!isRegister); }}
          > 
            {isRegister ? 'Déjà un compte ? Connectez-vous' : "Pas de compte ? S'inscrire"} 
          </p> 
        </div>
      </div> 
    </div> 
  ); 
}