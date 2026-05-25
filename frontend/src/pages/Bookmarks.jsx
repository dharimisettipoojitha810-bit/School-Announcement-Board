import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Bookmark, AlertCircle, FileText, CheckCircle2, Calendar } from 'lucide-react';

const Bookmarks = () => {
  const { showToast } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.announcements.getBookmarks();
      setBookmarks(res.data);
    } catch (error) {
      showToast('Error loading bookmarks: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemoveBookmark = async (e, id) => {
    e.stopPropagation();
    try {
      await api.announcements.toggleBookmark(id);
      showToast('Removed from Bookmarks');
      setBookmarks(prev => prev.filter(b => b._id !== id));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Bookmark className="text-indigo-400" />
          <span>My Bookmarked Bulletins</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Quickly access important bulletins, schedules, and permission slips.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-gray-800">
          <AlertCircle className="mx-auto text-gray-500 mb-3" size={32} />
          <h3 className="text-sm font-bold text-white">No Saved Announcements</h3>
          <p className="text-xs text-gray-500 mt-1">Pin articles in the feed to access them instantly from this workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((ann) => (
            <div
              key={ann._id}
              className={`glass-card p-5 rounded-3xl flex flex-col justify-between min-h-[200px] border border-gray-800`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {ann.category?.name || 'General'}
                  </span>
                  
                  <button
                    onClick={(e) => handleRemoveBookmark(e, ann._id)}
                    className="p-1 rounded-lg text-indigo-400 hover:text-red-400"
                    title="Remove Bookmark"
                  >
                    <Bookmark size={14} className="fill-indigo-500" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug line-clamp-2">{ann.title}</h3>
                <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                  {ann.content.replace(/\*\*|_/g, '')}
                </p>
              </div>

              <div className="border-t border-gray-800/60 pt-3 mt-4 flex justify-between items-center text-[10px]">
                <span className="text-gray-400 font-semibold">{ann.author?.username}</span>
                <span className="text-gray-500 font-mono">{new Date(ann.publishAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
