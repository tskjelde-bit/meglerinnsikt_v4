import React, { useState, useEffect, useRef } from 'react';
import { BlogPostFull } from '../../types';
import { blogService } from '../../services/blogService';
import BlogEditor from './BlogEditor';
import {
  X, Plus, Pencil, Trash2, Eye, EyeOff, Download, Upload,
  FileJson, RefreshCw, Search, Calendar, Rocket, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

interface BlogAdminProps {
  posts: BlogPostFull[];
  onPostsChange: (posts: BlogPostFull[]) => void;
  onClose: () => void;
}

const BlogAdmin: React.FC<BlogAdminProps> = ({ posts, onPostsChange, onClose }) => {
  const [localPosts, setLocalPosts] = useState<BlogPostFull[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPostFull | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishStatus, setPublishStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load from localStorage, or seed from production posts
    const stored = blogService.getLocalPosts();
    if (stored.length > 0) {
      setLocalPosts(stored);
    } else if (posts.length > 0) {
      blogService.saveLocalPosts(posts);
      setLocalPosts(posts);
    }
  }, [posts]);

  const handleSavePost = (post: BlogPostFull) => {
    const updated = blogService.savePost(post);
    setLocalPosts(updated);
    onPostsChange(updated.filter(p => p.published));
    setEditingPost(null);
  };

  const handleDeletePost = (id: string) => {
    if (!confirm('Er du sikker på at du vil slette dette innlegget?')) return;
    const updated = blogService.deletePost(id);
    setLocalPosts(updated);
    onPostsChange(updated.filter(p => p.published));
  };

  const handleTogglePublished = (post: BlogPostFull) => {
    const updated = blogService.savePost({ ...post, published: !post.published });
    setLocalPosts(updated);
    onPostsChange(updated.filter(p => p.published));
  };

  const handleCreateNew = () => {
    setEditingPost(blogService.createEmptyPost());
  };

  const handleExport = () => {
    blogService.downloadJSON();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = blogService.importJSON(event.target?.result as string);
        setLocalPosts(imported);
        onPostsChange(imported.filter(p => p.published));
      } catch (err) {
        alert('Feil ved import av JSON. Sjekk filformatet.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportFromProduction = async () => {
    const fetched = await blogService.fetchPosts();
    if (fetched.length > 0) {
      blogService.saveLocalPosts(fetched);
      setLocalPosts(fetched);
      onPostsChange(fetched.filter(p => p.published));
    }
  };

  const handlePublish = async () => {
    setPublishStatus({ type: 'loading' });
    const result = await blogService.publishPosts();
    if (result.success) {
      setPublishStatus({ type: 'success', message: result.message });
      // Also refresh the live view
      onPostsChange(localPosts.filter(p => p.published));
      setTimeout(() => setPublishStatus({ type: 'idle' }), 3000);
    } else {
      setPublishStatus({ type: 'error', message: result.message });
      setTimeout(() => setPublishStatus({ type: 'idle' }), 5000);
    }
  };

  const filteredPosts = localPosts.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If editing a post, show the editor
  if (editingPost) {
    return (
      <div className="fixed inset-0 z-[4000] bg-white flex flex-col">
        <BlogEditor
          post={editingPost}
          onSave={handleSavePost}
          onCancel={() => setEditingPost(null)}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
            Blog CMS
          </h1>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {localPosts.length} innlegg
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportFromProduction}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Hent fra produksjon"
          >
            <RefreshCw size={14} />
            Fra produksjon
          </button>
          <button
            onClick={handleImport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Upload size={14} />
            Importer JSON
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Download size={14} />
            Eksporter JSON
          </button>
          <button
            onClick={handlePublish}
            disabled={publishStatus.type === 'loading'}
            className={`flex items-center gap-2 px-5 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg ${
              publishStatus.type === 'success'
                ? 'bg-emerald-600 text-white'
                : publishStatus.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-200'
            }`}
          >
            {publishStatus.type === 'loading' ? (
              <><Loader2 size={14} className="animate-spin" /> Lagrer...</>
            ) : publishStatus.type === 'success' ? (
              <><CheckCircle2 size={14} /> {publishStatus.message}</>
            ) : publishStatus.type === 'error' ? (
              <><AlertCircle size={14} /> {publishStatus.message || 'Feil!'}</>
            ) : (
              <><Rocket size={14} /> Publiser</>
            )}
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors uppercase tracking-wider"
          >
            <Plus size={14} />
            Nytt innlegg
          </button>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 transition-colors ml-2"
          >
            <X size={20} />
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileImport}
        />
      </header>

      {/* Search */}
      <div className="px-6 py-4 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 max-w-md">
          <Search size={16} className="text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Søk i innlegg..."
            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full"
          />
        </div>
      </div>

      {/* Post List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <FileJson size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Ingen innlegg funnet</p>
            <button
              onClick={handleCreateNew}
              className="mt-4 text-blue-600 font-bold text-sm hover:underline"
            >
              Opprett ditt første innlegg
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-w-5xl">
            {filteredPosts
              .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime())
              .map(post => (
              <div
                key={post.id}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                  {post.image ? (
                    <img src={post.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <FileJson size={24} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight truncate">
                    {post.title || 'Uten tittel'}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {post.date || post.dateISO}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      post.published
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {post.published ? 'Publisert' : 'Utkast'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePublished(post)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title={post.published ? 'Avpubliser' : 'Publiser'}
                  >
                    {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => setEditingPost(post)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Rediger"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Slett"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-6 py-3 bg-white border-t border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        Ctrl+Shift+A for å lukke • Endringer lagres i nettleseren • Trykk «Publiser» for å oppdatere posts.json
      </div>
    </div>
  );
};

export default BlogAdmin;
