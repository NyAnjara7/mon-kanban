import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  // charger commentaires
  async function loadComments() {
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    setComments(data || []);
  }

  useEffect(() => {
    loadComments();
  }, []);

  // ajouter commentaire
  async function addComment() {
    if (!text.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('task_comments').insert([
      {
        task_id: taskId,
        user_id: user.id,
        content: text
      }
    ]);

    setText('');
    loadComments();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <h4>💬 Commentaires</h4>

      {/* input */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ajouter un commentaire..."
      />
      <button onClick={addComment}>Envoyer</button>

      {/* liste */}
      {comments.map((c) => (
        <p key={c.id} style={{ fontSize: 12 }}>
          {c.content}
        </p>
      ))}
    </div>
  );
}