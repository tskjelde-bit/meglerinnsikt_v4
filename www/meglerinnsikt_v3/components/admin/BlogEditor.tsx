import React, { useState, useEffect } from 'react';
import { BlogPostFull, ContentBlock } from '../../types';
import { blogService } from '../../services/blogService';
import BlogContentRenderer from '../BlogContentRenderer';
import ContentBlockEditor from './ContentBlockEditor';
import {
  ArrowLeft, Save, Eye, EyeOff, Plus, Type, Image,
  Quote, List, ListOrdered, LayoutGrid, Heading
} from 'lucide-react';

interface BlogEditorProps {
  post: BlogPostFull;
  onSave: (post: BlogPostFull) => void;
  onCancel: () => void;
}

const CATEGORIES = ['MARKEDSINNSIKT', 'MARKEDSRAPPORTER', 'TIPS & TRIKS'];

const BLOCK_TEMPLATES: { type: string; label: string; icon: React.ReactNode; create: () => ContentBlock }[] = [
  { type: 'paragraph', label: 'Paragraf', icon: <Type size={14} />, create: () => ({ type: 'paragraph', text: '' }) },
  { type: 'heading', label: 'Overskrift', icon: <Heading size={14} />, create: () => ({ type: 'heading', level: 3, text: '' }) },
  { type: 'image', label: 'Bilde', icon: <Image size={14} />, create: () => ({ type: 'image', url: '', caption: '' }) },
  { type: 'quote', label: 'Sitat', icon: <Quote size={14} />, create: () => ({ type: 'quote', text: '' }) },
  { type: 'bulletList', label: 'Punktliste', icon: <List size={14} />, create: () => ({ type: 'bulletList', title: '', items: [''] }) },
  { type: 'numberedList', label: 'Nummerert', icon: <ListOrdered size={14} />, create: () => ({ type: 'numberedList', items: [{ title: '', description: '' }] }) },
  { type: 'imageGrid', label: 'Bildegrid', icon: <LayoutGrid size={14} />, create: () => ({ type: 'imageGrid', images: [{ url: '', caption: '' }, { url: '', caption: '' }] }) },
];

const BlogEditor: React.FC<BlogEditorProps> = ({ post: initialPost, onSave, onCancel }) => {
  const [post, setPost] = useState<BlogPostFull>(initialPost);
  const [showPreview, setShowPreview] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [tagsInput, setTagsInput] = useState(initialPost.tags.join(', '));

  const updateField = <K extends keyof BlogPostFull>(key: K, value: BlogPostFull[K]) => {
    setPost(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'title' && !prev.slug) {
        updated.slug = blogService.generateSlug(value as string);
      }
      return updated;
    });
  };

  const updateAuthor = (key: string, value: string) => {
    setPost(prev => ({ ...prev, author: { ...prev.author, [key]: value } }));
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    const newContent = [...post.content];
    newContent[index] = block;
    setPost(prev => ({ ...prev, content: newContent }));
  };

  const addBlock = (template: ContentBlock) => {
    setPost(prev => ({ ...prev, content: [...prev.content, template] }));
    setShowAddBlock(false);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const newContent = [...post.content];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newContent.length) return;
    [newContent[index], newContent[targetIndex]] = [newContent[targetIndex], newContent[index]];
    setPost(prev => ({ ...prev, content: newContent }));
  };

  const deleteBlock = (index: number) => {
    setPost(prev => ({ ...prev, content: prev.content.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    const updatedPost = {
      ...post,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      date: post.date || formatDate(post.dateISO),
    };
    onSave(updatedPost);
  };

  const formatDate = (iso: string): string => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DES'];
    const d = new Date(iso);
    return `${months[d.getMonth()]} ${d.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
            {post.id ? 'Rediger innlegg' : 'Nytt innlegg'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Skjul forhåndsvisning' : 'Forhåndsvisning'}
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors uppercase tracking-wider"
          >
            <Save size={16} />
            Lagre
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto">
        <div className={`flex ${showPreview ? 'gap-8' : ''} max-w-[1400px] mx-auto p-6`}>

          {/* Left: Editor Form */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full max-w-3xl mx-auto'} space-y-6`}>

            {/* Metadata Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Metadata</h3>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tittel</label>
                <input
                  value={post.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Skriv tittel..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Slug</label>
                  <input
                    value={post.slug}
                    onChange={(e) => updateField('slug', e.target.value)}
                    placeholder="url-vennlig-slug"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Kategori</label>
                  <select
                    value={post.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dato (ISO)</label>
                  <input
                    type="date"
                    value={post.dateISO}
                    onChange={(e) => {
                      updateField('dateISO', e.target.value);
                      updateField('date', formatDate(e.target.value));
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Dato (visning)</label>
                  <input
                    value={post.date}
                    onChange={(e) => updateField('date', e.target.value)}
                    placeholder="JAN 12"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Lesetid</label>
                  <input
                    value={post.readTime}
                    onChange={(e) => updateField('readTime', e.target.value)}
                    placeholder="5 Min Read"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Hero-bilde URL</label>
                <input
                  value={post.image}
                  onChange={(e) => updateField('image', e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {post.image && (
                  <img src={post.image} alt="" className="w-full h-24 object-cover rounded-xl mt-2 border border-slate-200" />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Utdrag</label>
                <textarea
                  value={post.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  placeholder="Kort oppsummering av artikkelen..."
                  className="w-full min-h-[60px] px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 resize-y focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Tags (kommaseparert)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Boligpriser, Oslo, Analyse"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Publisert</label>
                <button
                  onClick={() => updateField('published', !post.published)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${post.published ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${post.published ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Content Blocks Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-6">Innholdsblokker</h3>

              <div className="space-y-4">
                {post.content.map((block, index) => (
                  <ContentBlockEditor
                    key={index}
                    block={block}
                    index={index}
                    total={post.content.length}
                    onChange={(b) => updateBlock(index, b)}
                    onMoveUp={() => moveBlock(index, -1)}
                    onMoveDown={() => moveBlock(index, 1)}
                    onDelete={() => deleteBlock(index)}
                  />
                ))}
              </div>

              {/* Add Block Button */}
              <div className="mt-6 relative">
                <button
                  onClick={() => setShowAddBlock(!showAddBlock)}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-2xl text-sm font-bold text-slate-400 hover:text-blue-600 hover:border-blue-400 transition-all"
                >
                  <Plus size={18} />
                  Legg til blokk
                </button>

                {showAddBlock && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 grid grid-cols-4 gap-2 z-50">
                    {BLOCK_TEMPLATES.map(template => (
                      <button
                        key={template.type}
                        onClick={() => addBlock(template.create())}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors text-slate-500"
                      >
                        {template.icon}
                        <span className="text-[10px] font-bold uppercase">{template.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          {showPreview && (
            <div className="w-1/2 bg-white rounded-2xl border border-slate-200 p-8 overflow-y-auto max-h-[calc(100vh-160px)] sticky top-6">
              <div className="mb-6 pb-4 border-b border-slate-100">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{post.category}</span>
                <h1 className="text-2xl font-black text-slate-950 uppercase tracking-tight mt-2 leading-tight">{post.title || 'Uten tittel'}</h1>
                <p className="text-sm text-slate-400 mt-2">{post.readTime} • {post.date}</p>
              </div>
              {post.content.length > 0 ? (
                <BlogContentRenderer blocks={post.content} />
              ) : (
                <p className="text-slate-400 text-sm italic">Legg til innholdsblokker for å se forhåndsvisning...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
