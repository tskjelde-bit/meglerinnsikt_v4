import React from 'react';
import { ContentBlock } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface BlogContentRendererProps {
  blocks: ContentBlock[];
}

const BlogContentRenderer: React.FC<BlogContentRendererProps> = ({ blocks }) => {
  let paragraphCount = 0;

  return (
    <div className="prose prose-slate max-w-none">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading': {
            const classes: Record<number, string> = {
              2: 'text-[34px] font-black text-slate-950 uppercase tracking-tight mt-0 mb-8 leading-tight',
              3: 'text-2xl font-black text-slate-900 uppercase tracking-tight mt-16 mb-6',
              4: 'text-xl font-black text-slate-900 uppercase tracking-tight mb-6',
              5: 'text-[16px] font-black text-slate-900 uppercase tracking-tight mb-4',
            };
            const Tag = `h${block.level}` as keyof JSX.IntrinsicElements;
            return <Tag key={index} className={classes[block.level]}>{block.text}</Tag>;
          }

          case 'paragraph': {
            paragraphCount++;
            const isLead = paragraphCount === 1;
            return (
              <p
                key={index}
                className={
                  isLead
                    ? 'text-xl leading-relaxed text-slate-600 font-medium mb-12'
                    : 'text-slate-600 leading-relaxed mb-10'
                }
              >
                {block.text}
              </p>
            );
          }

          case 'image':
            return (
              <div key={index} className="my-12 md:my-16 rounded-[24px] md:rounded-[40px] overflow-hidden shadow-xl border border-slate-100">
                <img
                  src={block.url}
                  alt={block.caption || ''}
                  className="w-full h-80 object-cover"
                />
                {block.caption && (
                  <div className="p-4 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
                    {block.caption}
                  </div>
                )}
              </div>
            );

          case 'quote':
            return (
              <div key={index} className="p-6 md:p-10 border-l-[8px] border-blue-600 bg-blue-50/50 rounded-r-[32px] my-12 md:my-16">
                <p className="text-xl md:text-2xl font-black text-slate-900 italic leading-snug tracking-tight">
                  "{block.text}"
                </p>
              </div>
            );

          case 'bulletList':
            return (
              <div key={index} className="bg-slate-50 p-6 md:p-10 rounded-[24px] md:rounded-[40px] border border-slate-100 mb-12">
                {block.title && (
                  <h4 className="text-[14px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6">
                    {block.title}
                  </h4>
                )}
                <ul className="space-y-4 m-0 p-0 list-none">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex gap-4 items-start text-slate-700 font-medium">
                      <CheckCircle2 className="text-blue-500 shrink-0 mt-1" size={18} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );

          case 'numberedList':
            return (
              <div key={index} className="space-y-8 mb-16">
                {block.items.map((item, i) => (
                  <div key={i} className="flex gap-6 items-start group">
                    <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl flex items-center justify-center text-lg font-black shrink-0 group-hover:bg-blue-600 transition-colors">
                      {i + 1}
                    </div>
                    <div>
                      <h6 className="text-[15px] font-black text-slate-900 uppercase mb-1">{item.title}</h6>
                      <p className="text-[14px] text-slate-500 font-medium leading-relaxed m-0">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            );

          case 'imageGrid':
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 my-16">
                {block.images.map((img, i) => (
                  <div key={i} className="rounded-[32px] overflow-hidden shadow-lg">
                    <img src={img.url} alt={img.caption} className="w-full h-64 object-cover" />
                    <div className="p-3 bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
                      {img.caption}
                    </div>
                  </div>
                ))}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default BlogContentRenderer;
