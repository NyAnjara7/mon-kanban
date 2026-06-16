import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Écouter les changements (connexion, déconnexion, mot de passe oublié)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      
      // Si l'utilisateur clique sur le lien de reset, on force la redirection
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/update-password';
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={session ? <Navigate to='/dashboard' /> : <LoginPage />} />
        <Route path='/dashboard' element={session ? <DashboardPage session={session} /> : <Navigate to='/login' />} />
        <Route path='/profile' element={session ? <ProfilePage session={session} /> : <Navigate to='/login' />} />
        <Route path='/update-password' element={<UpdatePasswordPage />} />
        <Route path='*' element={<Navigate to={session ? '/dashboard' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;