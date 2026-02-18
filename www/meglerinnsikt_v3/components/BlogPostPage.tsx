import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlogPost, BlogPostFull } from '../types';
import { blogService } from '../services/blogService';
import { MOCK_BLOG_POSTS } from '../constants';
import BlogPostDetail from './BlogPostDetail';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostFull | null>(null);
  const [allPosts, setAllPosts] = useState<(BlogPost | BlogPostFull)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      const posts = await blogService.fetchPosts();
      if (posts.length > 0) {
        setAllPosts(posts);
        const found = posts.find(p => p.slug === slug);
        if (found) {
          setPost(found);
        }
      } else {
        setAllPosts(MOCK_BLOG_POSTS);
      }
      setLoading(false);
    };
    loadPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[3000] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Laster innlegg...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="fixed inset-0 z-[3000] bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight mb-4">404</h1>
          <p className="text-slate-500 font-medium mb-8">Innlegget ble ikke funnet.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors"
          >
            Tilbake til forsiden
          </button>
        </div>
      </div>
    );
  }

  return (
    <BlogPostDetail
      post={post}
      allPosts={allPosts}
      onClose={() => navigate('/')}
      onPostClick={(clickedPost) => {
        if ('slug' in clickedPost && (clickedPost as BlogPostFull).slug) {
          navigate(`/blog/${(clickedPost as BlogPostFull).slug}`);
        }
      }}
    />
  );
};

export default BlogPostPage;
