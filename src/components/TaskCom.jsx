import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function TaskComments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');

  // charger commentaires
  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    setComments(data || []);
  }

  async function addComment() {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('task_comments').insert({
      task_id: taskId,
      user_id: user.id,
      content
    });

    setContent('');
    fetchComments();
  }

  return (
    <div style={{ marginTop: 10 }}>
      <h4>💬 Commentaires</h4>

      {comments.map(c => (
        <p key={c.id} style={{ fontSize: 12 }}>
          {c.content}
        </p>
      ))}

      <input
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Ajouter un commentaire"
        style={{ width: '100%', marginTop: 5 }}
      />

      <button onClick={addComment}>
        Ajouter
      </button>
    </div>
  );
}