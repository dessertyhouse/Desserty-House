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

  // Live preview of the selected image before upload
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Which button submitted the form: publish immediately or save as draft
  const [publishMode, setPublishMode] = useState<'publish' | 'draft'>('publish');

  function onImageSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  const headers = {};

  async function refresh() {
    setLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/admin/posts', { headers });
      const data = await res.json();
      
      if (data.success) {
        // Customer feedback screenshots have their own dedicated tab now,
        // so keep this list to blog posts, offers and announcements only.
        setPosts((data.posts || []).filter((p: Post) => p.kind !== 'feedback'));
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
      // Draft = uploaded + saved but NOT visible on the website until published
      formDataToSend.set('publish', publishMode === 'publish' ? 'true' : 'false');

      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers,
        body: formDataToSend
      });

      const data = await res.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text:
            publishMode === 'publish'
              ? 'Post published successfully! It is now live on the website.'
              : 'Draft saved! Review it below, then press "Draft" to publish when ready.'
        });
        setFormData({ title: '', description: '', kind: 'offer' });
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
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

  // --- Edit an existing (even already-published) post: title, description, type ---
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editForm, setEditForm] = useState<PostFormData>({ title: '', description: '', kind: 'offer' });
  const [savingEdit, setSavingEdit] = useState(false);

  function startEdit(post: Post) {
    setEditingPost(post);
    setEditForm({ title: post.title, description: post.description || '', kind: post.kind });
    setMessage(null);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPost) return;
    if (!editForm.title.trim()) {
      setMessage({ type: 'error', text: 'Title is required.' });
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingPost.id,
          title: editForm.title,
          description: editForm.description,
          kind: editForm.kind
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Post updated.' });
        setEditingPost(null);
        refresh();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update post.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update post.' });
    }
    setSavingEdit(false);
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
                onChange={onImageSelected}
              />
            </label>

            {/* Live preview — exactly how the card will look on the website */}
            {(previewUrl || formData.title || formData.description) && (
              <div className="post-preview">
                <p className="post-preview-label">
                  Preview — how this will appear on the {formData.kind === 'feedback' ? '/feedback' : '/posts'} page:
                </p>
                <div className="showcase-card post-preview-card">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Selected post" />
                  ) : (
                    <div className="post-preview-noimg">Image preview appears here</div>
                  )}
                  <div>
                    <span className="sku">{(formData.kind || 'update').toUpperCase()}</span>
                    <h3>{formData.title || 'Post title…'}</h3>
                    <p>{formData.description || 'Post description…'}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="post-submit-row">
              <button
                type="submit"
                className="btn"
                disabled={uploading}
                onClick={() => setPublishMode('draft')}
                title="Upload and save without showing on the website — you can review and publish later"
              >
                {uploading && publishMode === 'draft' ? 'Saving draft…' : 'Save as draft (review first)'}
              </button>
              <button
                type="submit"
                className="btn gold"
                disabled={uploading}
                onClick={() => setPublishMode('publish')}
              >
                {uploading && publishMode === 'publish' ? (
                  <>
                    <span className="spinner small"></span>
                    Uploading to Cloudinary...
                  </>
                ) : (
                  'Publish now'
                )}
              </button>
            </div>
            <p className="muted post-submit-hint">
              Tip: use <b>Save as draft</b> to upload safely, check the preview in the list below,
              edit if needed, then click its <b>Draft</b> button to publish.
            </p>
          </form>
        </div>

        {/* Posts List */}
        <div className="posts-section">
          <div className="section-header">
            <h3>All Posts ({posts.length}) — {posts.filter(p => p.is_published).length} live, {posts.filter(p => !p.is_published).length} draft</h3>
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
                    {!post.is_published && <span className="draft-badge">DRAFT — not visible on website</span>}
                  </div>
                  <div className="post-content">
                    <h4>{post.title}</h4>
                    <p>{post.description}</p>
                    {post.post_code && (
                      <span className="post-code">{post.post_code}</span>
                    )}
                    {editingPost?.id === post.id ? (
                      <form onSubmit={saveEdit} className="post-edit-form">
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="Title"
                          required
                        />
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                          rows={3}
                        />
                        <select
                          value={editForm.kind}
                          onChange={e => setEditForm({ ...editForm, kind: e.target.value })}
                        >
                          <option value="offer">Offer</option>
                          <option value="new launch">New Launch</option>
                          <option value="announcement">Announcement</option>
                          <option value="seasonal">Seasonal</option>
                          <option value="feedback">Customer Feedback (shows on /feedback page)</option>
                        </select>
                        <div className="post-actions">
                          <button type="submit" className="btn small" disabled={savingEdit}>
                            {savingEdit ? 'Saving...' : 'Save changes'}
                          </button>
                          <button type="button" className="btn small outline" onClick={() => setEditingPost(null)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                    <div className="post-actions">
                      <button
                        className={`btn small ${post.is_published ? '' : 'outline'}`}
                        onClick={() => togglePublish(post)}
                        title={post.is_published ? 'Click to unpublish (hide from website)' : 'Click to publish (show on website)'}
                      >
                        {post.is_published ? 'Published ✓ (click to hide)' : 'Draft — click to publish'}
                      </button>
                      <button
                        className="btn small outline"
                        onClick={() => startEdit(post)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn small danger"
                        onClick={() => remove(post)}
                      >
                        Delete
                      </button>
                    </div>
                    )}
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
