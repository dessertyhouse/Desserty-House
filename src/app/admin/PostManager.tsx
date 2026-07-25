'use client';

import { useState } from 'react';

type Post = {
  id: string;
  title: string;
  description?: string;
  kind: string;
  image_url: string;
  post_code?: string;
  is_published: boolean;
  created_at: string;
};

type PostFormData = {
  title: string;
  description: string;
  kind: string;
};

export default function PostManager() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    description: '',
    kind: 'offer'
  });

  const headers = {};

  async function refresh() {
    setLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/admin/posts', { headers });
      const data = await res.json();
      
      if (data.success) {
        setPosts(data.posts);
        setLoaded(true);
      } else {
        setMessage({ type: 'error', text: data.error || 'Unable to load posts.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load posts.' });
    }
    
    setLoading(false);
  }

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setMessage(null);

    try {
      const form = e.currentTarget;
      const formDataToSend = new FormData(form);
      
      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.set(key, value);
      });

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers,
        body: formDataToSend
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Post published successfully!' });
        setFormData({ title: '', description: '', kind: 'offer' });
        form.reset();
        refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
    }

    setUploading(false);
  }

  async function remove(post: Post) {
    if (!confirm(`Delete "${post.title}"? This will remove the post from the website and delete the image from Cloudinary. This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/posts', {
        method: 'DELETE',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Post and image deleted.' });
        refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Could not delete post.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete post.' });
    }

    setLoading(false);
  }

  async function togglePublish(post: Post) {
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: post.id,
          is_published: !post.is_published
        })
      });

      const data = await res.json();

      if (data.success) {
        refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update post.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update post.' });
    }
  }

  return (
    <div className="post-manager">
      <div className="post-manager-header">
        <div>
          <h2>Content Studio</h2>
          <p className="muted">Manage offers, announcements and promotional posts</p>
        </div>
        <button 
          className="btn" 
          onClick={refresh} 
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <div className="post-manager-content">
        {/* Upload Form */}
        <div className="upload-section">
          <h3>Create New Post</h3>
          <form onSubmit={upload} className="post-form">
            <div className="form-row">
              <label>
                Post title *
                <input
                  type="text"
                  required
                  placeholder="e.g., Weekend brownie special"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </label>
              <label>
                Post type *
                <select
                  required
                  value={formData.kind}
                  onChange={e => setFormData({ ...formData, kind: e.target.value })}
                >
                  <option value="offer">Offer</option>
                  <option value="new launch">New Launch</option>
                  <option value="announcement">Announcement</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </label>
            </div>

            <label>
              Description *
              <textarea
                required
                placeholder="Describe the offer, who it's for, and how to order..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </label>

            <label className="file-input-label">
              Post image *
              <span className="file-hint">WebP, JPG or PNG; maximum 8 MB</span>
              <input
                type="file"
                name="image"
                required
                accept="image/webp,image/jpeg,image/png"
              />
            </label>

            <button type="submit" className="btn gold" disabled={uploading}>
              {uploading ? (
                <>
                  <span className="spinner small"></span>
                  Uploading to Cloudinary...
                </>
              ) : (
                'Upload & Publish Post'
              )}
            </button>
          </form>
        </div>

        {/* Posts List */}
        <div className="posts-section">
          <div className="section-header">
            <h3>Published Posts ({posts.length})</h3>
            {!loaded && (
              <button className="btn small" onClick={refresh}>
                Load posts
              </button>
            )}
          </div>

          {posts.length === 0 && loaded ? (
            <div className="empty-state">
              <p>No posts yet. Create your first post above!</p>
            </div>
          ) : (
            <div className="posts-grid">
              {posts.map(post => (
                <div key={post.id} className={`post-card ${!post.is_published ? 'unpublished' : ''}`}>
                  <div className="post-image">
                    <img src={post.image_url} alt={post.title} />
                    <span className="post-kind">{post.kind}</span>
                  </div>
                  <div className="post-content">
                    <h4>{post.title}</h4>
                    <p>{post.description}</p>
                    {post.post_code && (
                      <span className="post-code">{post.post_code}</span>
                    )}
                    <div className="post-actions">
                      <button
                        className={`btn small ${post.is_published ? '' : 'outline'}`}
                        onClick={() => togglePublish(post)}
                      >
                        {post.is_published ? 'Published' : 'Draft'}
                      </button>
                      <button
                        className="btn small danger"
                        onClick={() => remove(post)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
