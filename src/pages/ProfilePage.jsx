// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session }) {
  const user = session.user;

  // États pour les informations de profil
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');

  // États pour le changement de mot de passe
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  // États pour la gestion de l'avatar photo
  const [avatarUrl, setAvatarUrl] = useState(user.user_metadata?.avatar_url || '');
  const [uploading, setUploading] = useState(false);

  // Sauvegarde du nom complet dans les metadata d'authentification
  async function handleSaveInfo(e) {
    e.preventDefault();
    setInfoErr('');
    setInfoMsg('');

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    if (error) setInfoErr(error.message);
    else setInfoMsg('✅ Profil mis à jour !');
  }

  // Mise à jour sécurisée du mot de passe
  async function handleChangePassword(e) {
    e.preventDefault();
    setPassErr('');
    setPassMsg('');

    if (newPass.length < 6) {
      setPassErr('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPass
    });

    if (error) setPassErr(error.message);
    else {
      setPassMsg('✅ Mot de passe mis à jour !');
      setNewPass('');
    }
  }

  // Téléversement d'image vers le bucket 'avatars' de Supabase Storage
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert('Erreur upload : ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl }
    });

    setAvatarUrl(publicUrl);
    setUploading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar session={session} />

      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Titre principal */}
        <div>
          <h1 className="text-xl font-bold text-slate-800">Mon profil</h1>
          <p className="text-xs text-slate-500">Gérez vos informations personnelles et la sécurité de votre compte.</p>
        </div>

        {/* SECTION 1 : AVATAR / PHOTO DE PROFIL */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center space-y-3">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-2 border-slate-300 shadow-inner flex items-center justify-center relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl text-slate-400">👤</span>
            )}
          </div>

          <label className={`text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 cursor-pointer shadow-sm transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploading ? 'Envoi en cours...' : 'Changer la photo'}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
          </label>
        </section>

        {/* SECTION 2 : INFORMATIONS GÉNÉRALES */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 pb-1.5 border-b border-slate-100">Informations générales</h2>
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Adresse e-mail (Non modifiable)</span>
            <span className="text-xs font-semibold text-slate-700">{user.email}</span>
          </div>

          <form onSubmit={handleSaveInfo} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] transition-all"
              />
            </div>

            {/* Notifications retour d'information */}
            {infoErr && <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{infoErr}</p>}
            {infoMsg && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">{infoMsg}</p>}

            <button
              type="submit"
              className="bg-[#1A8C82] hover:bg-[#146e66] text-white text-xs font-bold py-2 px-4 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Sauvegarder
            </button>
          </form>
        </section>

        {/* SECTION 3 : SÉCURITÉ / MOT DE PASSE */}
        <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-800 pb-1.5 border-b border-slate-100">Changer le mot de passe</h2>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="6 caractères minimum"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1A8C82] transition-all"
              />
            </div>

            {/* Notifications retour de sécurité */}
            {passErr && <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{passErr}</p>}
            {passMsg && <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">{passMsg}</p>}

            <button
              type="submit"
              className="bg-[#1A8C82] hover:bg-[#146e66] text-white text-xs font-bold py-2 px-4 rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Mettre à jour
            </button>
          </form>
        </section>

      </main>
    </div>
  );
}