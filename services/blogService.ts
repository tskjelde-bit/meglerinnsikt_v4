import { BlogPostFull } from '../types';

const STORAGE_KEY = 'meglerinnsikt_blog_posts';

export const blogService = {
  // Fetch production posts from public/blog/posts.json
  async fetchPosts(): Promise<BlogPostFull[]> {
    try {
      const basePath = import.meta.env.BASE_URL || '/';
      const res = await fetch(`${basePath}blog/posts.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: BlogPostFull[] = await res.json();
      return data
        .filter(p => p.published)
        .sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());
    } catch (e) {
      console.warn('Failed to fetch posts.json, using fallback:', e);
      return [];
    }
  },

  // Get all posts from localStorage (admin editing)
  getLocalPosts(): BlogPostFull[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Save all posts to localStorage
  saveLocalPosts(posts: BlogPostFull[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  },

  // Save a single post (create or update)
  savePost(post: BlogPostFull): BlogPostFull[] {
    const posts = this.getLocalPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx >= 0) {
      posts[idx] = post;
    } else {
      posts.push(post);
    }
    this.saveLocalPosts(posts);
    return posts;
  },

  // Delete a post by ID
  deletePost(id: string): BlogPostFull[] {
    const posts = this.getLocalPosts().filter(p => p.id !== id);
    this.saveLocalPosts(posts);
    return posts;
  },

  // Export all local posts as JSON string
  exportJSON(): string {
    return JSON.stringify(this.getLocalPosts(), null, 2);
  },

  // Import posts from JSON string
  importJSON(json: string): BlogPostFull[] {
    const posts: BlogPostFull[] = JSON.parse(json);
    this.saveLocalPosts(posts);
    return posts;
  },

  // Generate unique ID
  generateId(): string {
    return 'bp_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  },

  // Generate URL-friendly slug from title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[æ]/g, 'ae')
      .replace(/[ø]/g, 'o')
      .replace(/[å]/g, 'aa')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  },

  // Create empty post template
  createEmptyPost(): BlogPostFull {
    const id = this.generateId();
    return {
      id,
      slug: '',
      title: '',
      date: '',
      dateISO: new Date().toISOString().split('T')[0],
      category: 'MARKEDSINNSIKT',
      image: '',
      excerpt: '',
      author: {
        name: 'Torbjørn Skjelde',
        title: 'Markedsanalytiker & Partner',
        image: 'https://cdn.prod.website-files.com/691779eac33d8a85e5cce47f/691cdde168737019d77f443a_profil-farger.avif'
      },
      readTime: '5 Min Read',
      tags: [],
      published: false,
      content: [
        { type: 'heading', level: 2, text: '' },
        { type: 'paragraph', text: '' }
      ]
    };
  },

  // Download JSON file
  downloadJSON(filename: string = 'posts.json'): void {
    const json = this.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  // Publish posts: write directly to public/blog/posts.json via dev server API
  async publishPosts(): Promise<{ success: boolean; message: string }> {
    const posts = this.getLocalPosts();
    try {
      const res = await fetch('/api/save-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posts)
      });
      const data = await res.json();
      if (data.success) {
        return { success: true, message: `${data.count} innlegg lagret til posts.json` };
      }
      return { success: false, message: data.error || 'Ukjent feil' };
    } catch (err: any) {
      return { success: false, message: `Kunne ikke nå dev-serveren: ${err.message}` };
    }
  }
};
