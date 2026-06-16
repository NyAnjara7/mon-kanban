// src/pages/ProfilePage.jsx
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

export default function ProfilePage({ session }) {
  const user = session.user;

  // ── États infos générales ─────────────────────
  const [fullName, setFullName] = useState(
    user.user_metadata?.full_name || ''
  );
  const [infoMsg, setInfoMsg] = useState('');
  const [infoErr, setInfoErr] = useState('');

  // ── États mot de passe ────────────────────────
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  // ── Avatar ────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState(
    user.user_metadata?.avatar_url || ''
  );
  const [uploading, setUploading] = useState(false);

  // ── Sauvegarder nom ───────────────────────────
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

  // ── Changer mot de passe ──────────────────────
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

  // ── Upload avatar ─────────────────────────────
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

  // ── UI (fusion du style 2 + structure React propre) ──
  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      <Navbar session={session} />

      <main
        style={{
          maxWidth: '600px',
          margin: '2rem auto',
          padding: '0 1rem'
        }}
      >
        <h1 style={{ marginBottom: '2rem' }}>Mon profil</h1>

        {/* ── AVATAR ── */}
        <section style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              overflow: 'hidden',
              margin: '0 auto 1rem',
              background: '#CBD5E1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>👤</span>
            )}
          </div>

          <label style={{ cursor: 'pointer', color: '#1A8C82' }}>
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

        {/* ── INFOS PROFIL ── */}
        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}
        >
          <h2>Informations générales</h2>
          <p style={{ color: '#64748B' }}>Email : {user.email}</p>

          <form onSubmit={handleSaveInfo}>
            <label>Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                marginTop: 8,
                marginBottom: 10
              }}
            />

            {infoErr && <p style={{ color: 'red' }}>{infoErr}</p>}
            {infoMsg && <p style={{ color: 'green' }}>{infoMsg}</p>}

            <button
              type="submit"
              style={{
                background: '#1A8C82',
                color: '#fff',
                border: 'none',
                padding: '10px 15px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Sauvegarder
            </button>
          </form>
        </section>

        {/* ── MOT DE PASSE ── */}
        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.07)'
          }}
        >
          <h2>Changer le mot de passe</h2>

          <form onSubmit={handleChangePassword}>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="6 caractères minimum"
              style={{
                width: '100%',
                padding: 10,
                border: '1px solid #CBD5E1',
                borderRadius: 8,
                marginTop: 10,
                marginBottom: 10
              }}
            />

            {passErr && <p style={{ color: 'red' }}>{passErr}</p>}
            {passMsg && <p style={{ color: 'green' }}>{passMsg}</p>}

            <button
              type="submit"
              style={{
                background: '#1A8C82',
                color: '#fff',
                border: 'none',
                padding: '10px 15px',
                borderRadius: 8,
                cursor: 'pointer'
              }}
            >
              Mettre à jour
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}