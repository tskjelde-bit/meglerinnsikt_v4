import React from 'react';
import { ContentBlock } from '../../types';
import { Plus, Trash2, ChevronUp, ChevronDown, Image, Type, Quote, List, ListOrdered, LayoutGrid } from 'lucide-react';

interface ContentBlockEditorProps {
  block: ContentBlock;
  index: number;
  total: number;
  onChange: (block: ContentBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

const BLOCK_LABELS: Record<string, string> = {
  paragraph: 'Paragraf',
  heading: 'Overskrift',
  image: 'Bilde',
  quote: 'Sitat',
  bulletList: 'Punktliste',
  numberedList: 'Nummerert liste',
  imageGrid: 'Bildegrid',
};

const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  block, index, total, onChange, onMoveUp, onMoveDown, onDelete
}) => {
  return (
    <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
      {/* Block Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {BLOCK_LABELS[block.type] || block.type}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-2"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Block Content Editor */}
      <div className="p-4">
        {block.type === 'paragraph' && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Skriv avsnitt..."
            className="w-full min-h-[80px] px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 resize-y focus:ring-2 focus:ring-blue-500 outline-none"
          />
        )}

        {block.type === 'heading' && (
          <div className="space-y-2">
            <div className="flex gap-2">
              {([2, 3, 4, 5] as const).map(level => (
                <button
                  key={level}
                  onClick={() => onChange({ ...block, level })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                    block.level === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  H{level}
                </button>
              ))}
            </div>
            <input
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Overskrift..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            <input
              value={block.url}
              onChange={(e) => onChange({ ...block, url: e.target.value })}
              placeholder="Bilde-URL..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              value={block.caption || ''}
              onChange={(e) => onChange({ ...block, caption: e.target.value })}
              placeholder="Bildetekst (valgfritt)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {block.url && (
              <img src={block.url} alt="" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
            )}
          </div>
        )}

        {block.type === 'quote' && (
          <textarea
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Sitat..."
            className="w-full min-h-[60px] px-3 py-2 border-l-4 border-blue-600 bg-blue-50/50 rounded-r-xl text-sm text-slate-700 italic resize-y focus:ring-2 focus:ring-blue-500 outline-none"
          />
        )}

        {block.type === 'bulletList' && (
          <div className="space-y-3">
            <input
              value={block.title || ''}
              onChange={(e) => onChange({ ...block, title: e.target.value })}
              placeholder="Listetittel (valgfritt)..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={item}
                  onChange={(e) => {
                    const newItems = [...block.items];
                    newItems[i] = e.target.value;
                    onChange({ ...block, items: newItems });
                  }}
                  placeholder={`Punkt ${i + 1}...`}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={() => {
                    const newItems = block.items.filter((_, idx) => idx !== i);
                    onChange({ ...block, items: newItems });
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, items: [...block.items, ''] })}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={14} /> Legg til punkt
            </button>
          </div>
        )}

        {block.type === 'numberedList' && (
          <div className="space-y-3">
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-1">
                  <input
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...block.items];
                      newItems[i] = { ...newItems[i], title: e.target.value };
                      onChange({ ...block, items: newItems });
                    }}
                    placeholder="Tittel..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    value={item.description}
                    onChange={(e) => {
                      const newItems = [...block.items];
                      newItems[i] = { ...newItems[i], description: e.target.value };
                      onChange({ ...block, items: newItems });
                    }}
                    placeholder="Beskrivelse..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    const newItems = block.items.filter((_, idx) => idx !== i);
                    onChange({ ...block, items: newItems });
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, items: [...block.items, { title: '', description: '' }] })}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={14} /> Legg til steg
            </button>
          </div>
        )}

        {block.type === 'imageGrid' && (
          <div className="space-y-3">
            {block.images.map((img, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <input
                    value={img.url}
                    onChange={(e) => {
                      const newImages = [...block.images];
                      newImages[i] = { ...newImages[i], url: e.target.value };
                      onChange({ ...block, images: newImages });
                    }}
                    placeholder="Bilde-URL..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <input
                    value={img.caption}
                    onChange={(e) => {
                      const newImages = [...block.images];
                      newImages[i] = { ...newImages[i], caption: e.target.value };
                      onChange({ ...block, images: newImages });
                    }}
                    placeholder="Bildetekst..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    const newImages = block.images.filter((_, idx) => idx !== i);
                    onChange({ ...block, images: newImages });
                  }}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors mt-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onChange({ ...block, images: [...block.images, { url: '', caption: '' }] })}
              className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Plus size={14} /> Legg til bilde
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentBlockEditor;
