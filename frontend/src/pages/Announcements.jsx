import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Trash2, 
  Edit3, 
  Paperclip, 
  Check, 
  X, 
  MessageCircle,
  Eye,
  Bookmark,
  Calendar,
  AlertCircle,
  CheckCircle2,
  FileText
} from 'lucide-react';

const Announcements = () => {
  const { user, showToast } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [viewArchived, setViewArchived] = useState(false);

  // Overlay Modals
  const [detailsModal, setDetailsModal] = useState(null); // holds active announcement object
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // holds announcement being edited

  // Comment state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Signature state
  const [signatureText, setSignatureText] = useState('');

  // File Upload refs
  const fileInputRef = useRef(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    targetAudience: 'all',
    targetValue: '',
    priority: 'normal',
    isPinned: false,
    publishAt: '',
    expiresAt: '',
    eventDate: '',
    signatureRequired: false,
    commentsEnabled: true
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = viewArchived 
        ? await api.announcements.getArchive()
        : await api.announcements.getFeed();
      setAnnouncements(res.data);

      const catRes = await api.categories.getAll();
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catRes.data[0]._id }));
      }
    } catch (error) {
      showToast('Error loading announcements: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [viewArchived]);

  // Load details / comments when opening modal
  const openDetails = async (ann) => {
    try {
      const details = await api.announcements.getDetails(ann._id);
      setDetailsModal(details.data);
      
      const commRes = await api.comments.getByAnnouncement(ann._id);
      setComments(commRes.data);
      setSignatureText('');
    } catch (error) {
      showToast('Error loading details: ' + error.message, 'error');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await api.comments.create(detailsModal._id, newComment);
      setComments(prev => [...prev, res.data]);
      setNewComment('');
      showToast('Comment posted successfully');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await api.comments.delete(id);
      setComments(prev => prev.filter(c => c._id !== id));
      showToast('Comment deleted successfully');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleSignConsent = async (e) => {
    e.preventDefault();
    if (!signatureText.trim()) return;

    try {
      const res = await api.announcements.signConsent(detailsModal._id, signatureText);
      setDetailsModal(res.data);
      showToast('Digital consent signed successfully!');
      // Reload feed to update state
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleToggleBookmark = async (annId) => {
    try {
      await api.announcements.toggleBookmark(annId);
      showToast('Bookmark status updated!');
      loadData();
      if (detailsModal && detailsModal._id === annId) {
        // refresh details modal bookmarks array
        const details = await api.announcements.getDetails(annId);
        setDetailsModal(details.data);
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    if (fileInputRef.current && fileInputRef.current.files) {
      for (let i = 0; i < fileInputRef.current.files.length; i++) {
        dataToSend.append('files', fileInputRef.current.files[i]);
      }
    }

    try {
      await api.announcements.create(dataToSend);
      showToast('Announcement posted successfully!');
      setCreateModal(false);
      // Reset form
      setFormData({
        title: '',
        content: '',
        category: categories[0]?._id || '',
        targetAudience: 'all',
        targetValue: '',
        priority: 'normal',
        isPinned: false,
        publishAt: '',
        expiresAt: '',
        eventDate: '',
        signatureRequired: false,
        commentsEnabled: true
      });
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this announcement? All related comment logs will be permanently deleted.')) return;
    try {
      await api.announcements.delete(id);
      showToast('Announcement deleted');
      setDetailsModal(null);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleUpdateAnnouncement = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      dataToSend.append(key, formData[key]);
    });

    if (fileInputRef.current && fileInputRef.current.files) {
      for (let i = 0; i < fileInputRef.current.files.length; i++) {
        dataToSend.append('files', fileInputRef.current.files[i]);
      }
    }

    try {
      await api.announcements.update(editModal._id, dataToSend);
      showToast('Announcement updated successfully!');
      setEditModal(null);
      loadData();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const openEditModal = (ann) => {
    setEditModal(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category?._id || '',
      targetAudience: ann.targetAudience,
      targetValue: ann.targetValue || '',
      priority: ann.priority,
      isPinned: ann.isPinned,
      publishAt: ann.publishAt ? ann.publishAt.substring(0, 16) : '',
      expiresAt: ann.expiresAt ? ann.expiresAt.substring(0, 10) : '',
      eventDate: ann.eventDate ? ann.eventDate.substring(0, 10) : '',
      signatureRequired: ann.signatureRequired,
      commentsEnabled: ann.commentsEnabled
    });
  };

  // Client side search and filters mapping
  const filteredAnnouncements = announcements.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory ? item.category?._id === selectedCategory : true;
    const matchesPriority = selectedPriority ? item.priority === selectedPriority : true;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'high': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
    }
  };

  const getCategoryTagColor = (hex) => {
    return {
      backgroundColor: `${hex}10`,
      color: hex,
      borderColor: `${hex}30`
    };
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Bulletin Board</span>
            {viewArchived && <span className="text-xs uppercase tracking-widest font-extrabold px-3 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">Archived</span>}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Read, search, filter, and sign-off school board broadcasts.</p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Creator quick launcher */}
          {(user.role === 'admin' || user.role === 'teacher') && (
            <button
              onClick={() => setCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all w-full md:w-auto justify-center"
            >
              <Plus size={16} />
              <span>Create Announcement</span>
            </button>
          )}

          {/* Archive Toggle Button */}
          <button
            onClick={() => setViewArchived(!viewArchived)}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all w-full md:w-auto text-center ${
              viewArchived
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'border-gray-800 bg-gray-900/40 text-gray-400 hover:text-white'
            }`}
          >
            {viewArchived ? 'View Active Feed' : 'View Archived Feed'}
          </button>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-900/20 border border-gray-800/80 p-3 rounded-2xl">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
        >
          <option value="">All Priorities</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <div className="flex items-center justify-center text-xs text-gray-400 font-semibold bg-gray-900/30 border border-gray-800 px-3 rounded-xl">
          <Filter size={12} className="mr-1.5" />
          <span>Filtered {filteredAnnouncements.length} results</span>
        </div>
      </div>

      {/* Announcements Card Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[30vh]">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-3xl border border-gray-800">
          <AlertCircle className="mx-auto text-gray-500 mb-3" size={32} />
          <h3 className="text-sm font-bold text-white">No Announcements Found</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting the filters or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((ann) => (
            <div
              key={ann._id}
              onClick={() => openDetails(ann)}
              className={`glass-card p-5 rounded-3xl cursor-pointer flex flex-col justify-between min-h-[220px] ${
                ann.priority === 'urgent' ? 'glow-urgent' : ann.priority === 'high' ? 'glow-high' : ''
              }`}
            >
              <div>
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2 flex-wrap mb-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ann.isPinned && <span className="text-[9px] font-extrabold bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Pinned</span>}
                    {ann.priority !== 'normal' && (
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider ${getPriorityColor(ann.priority)}`}>
                        {ann.priority}
                      </span>
                    )}
                    <span 
                      style={getCategoryTagColor(ann.category?.colorHex)}
                      className="text-[9px] font-extrabold uppercase border px-2 py-0.5 rounded-full tracking-wider"
                    >
                      {ann.category?.name}
                    </span>
                  </div>
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBookmark(ann._id);
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-indigo-400"
                  >
                    <Bookmark size={14} className={ann.bookmarks?.includes(user._id) ? 'fill-indigo-500 text-indigo-500' : ''} />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white tracking-tight leading-snug line-clamp-2">{ann.title}</h3>
                
                {/* Content teaser */}
                <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                  {ann.content.replace(/\*\*|_/g, '')}
                </p>
              </div>

              {/* Author & Footer */}
              <div className="border-t border-gray-800/60 pt-3 mt-4 flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-2">
                  <img
                    src={ann.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={ann.author?.username}
                    className="w-5 h-5 rounded-full object-cover border border-gray-800"
                  />
                  <span className="text-gray-400 font-semibold">{ann.author?.username}</span>
                </div>
                <span className="text-gray-500 font-mono">{new Date(ann.publishAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Display Modal Overlay */}
      {detailsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl glass-panel max-h-[85vh] overflow-y-auto p-6 rounded-3xl border border-gray-800 shadow-2xl relative scrollbar-thin">
            {/* Close Button */}
            <button
              onClick={() => {
                setDetailsModal(null);
                loadData(); // reload feed views increment
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl border border-gray-800 bg-gray-900/30 hover:text-white text-gray-400"
            >
              <X size={16} />
            </button>

            {/* Badges and dates */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] mb-3">
              {detailsModal.isPinned && <span className="bg-indigo-600 text-white font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">Pinned</span>}
              <span className={`font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getPriorityColor(detailsModal.priority)}`}>
                {detailsModal.priority}
              </span>
              <span 
                style={getCategoryTagColor(detailsModal.category?.colorHex)}
                className="font-bold uppercase border px-2.5 py-0.5 rounded-full"
              >
                {detailsModal.category?.name}
              </span>
              <span className="text-gray-500 font-mono">Target: {detailsModal.targetAudience.toUpperCase()} {detailsModal.targetValue && `(${detailsModal.targetValue})`}</span>
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-white tracking-tight leading-snug mb-3 pr-8">{detailsModal.title}</h2>

            {/* Author bar */}
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4 mb-4">
              <img
                src={detailsModal.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={detailsModal.author?.username}
                className="w-8 h-8 rounded-full object-cover border border-gray-700"
              />
              <div>
                <p className="text-xs font-bold text-white">{detailsModal.author?.username}</p>
                <span className="text-[9px] uppercase tracking-wider text-gray-500">Published {new Date(detailsModal.publishAt).toLocaleString()}</span>
              </div>

              {/* Edit / Moderation controls */}
              {(user.role === 'admin' || (user.role === 'teacher' && detailsModal.author?._id === user._id)) && (
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setDetailsModal(null);
                      openEditModal(detailsModal);
                    }}
                    className="p-2 border border-gray-800 bg-gray-900/30 hover:border-indigo-500/20 hover:text-indigo-400 rounded-xl transition-all"
                    title="Edit Announcement"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(detailsModal._id)}
                    className="p-2 border border-gray-800 bg-gray-900/30 hover:border-red-500/20 hover:text-red-400 rounded-xl transition-all"
                    title="Delete Announcement"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Announcement Content (Markdown format rendered directly) */}
            <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed border-b border-gray-800 pb-4 mb-4">
              {detailsModal.content}
            </div>

            {/* Calendar Events Alert block */}
            {detailsModal.eventDate && (
              <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-2xl flex items-center gap-2 mb-4 text-xs text-indigo-300">
                <Calendar size={14} />
                <span>**School Event Sync**: This announcement is linked to the school schedule for **{new Date(detailsModal.eventDate).toLocaleDateString()}**.</span>
              </div>
            )}

            {/* File Attachments Section */}
            {detailsModal.attachments && detailsModal.attachments.length > 0 && (
              <div className="border-b border-gray-800 pb-4 mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attachments</h4>
                <div className="flex flex-wrap gap-2">
                  {detailsModal.attachments.map((file, i) => (
                    <a
                      key={i}
                      href={`${API_BASE_URL}${file.path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/40 border border-gray-800 rounded-xl text-xs text-gray-300 hover:text-white transition-all hover:bg-gray-800/40"
                    >
                      <Paperclip size={12} />
                      <span className="max-w-[150px] truncate">{file.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Digital Signature Parents consent slip */}
            {detailsModal.signatureRequired && (
              <div className="border-b border-gray-800 pb-4 mb-4 bg-cyan-950/10 border border-cyan-500/10 p-4 rounded-2xl">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-1">Parental Consent Sign-off</h4>
                <p className="text-[11px] text-gray-400 mb-3">A digital signature is required for this mandatory announcement/field slip.</p>
                
                {/* Checking if already signed */}
                {detailsModal.signatures.some(s => s.user?._id === user._id) ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 p-2.5 rounded-xl">
                    <CheckCircle2 size={14} />
                    <span>Consent Digital Signature captured successfully. Thank you.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSignConsent} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type your Full Name to sign consent..."
                      value={signatureText}
                      onChange={(e) => setSignatureText(e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
                    >
                      Sign Slip
                    </button>
                  </form>
                )}

                {/* Signed Users List (Only for Teacher or Admin review) */}
                {(user.role === 'admin' || user.role === 'teacher') && detailsModal.signatures.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Captured Consents ({detailsModal.signatures.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {detailsModal.signatures.map((sig, i) => (
                        <span key={i} className="text-[9px] bg-cyan-950/30 border border-cyan-800/20 text-cyan-300 px-2 py-0.5 rounded" title={`Signed at: ${new Date(sig.signedAt).toLocaleString()}`}>
                          {sig.signatureText} ({sig.user?.username})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Read Receipts Panel (Teachers and Admins view) */}
            {(user.role === 'admin' || user.role === 'teacher') && (
              <div className="border-b border-gray-800 pb-4 mb-4">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Eye size={12} />
                  <span>Read Receipts ({detailsModal.views?.length || 0})</span>
                </h4>
                {detailsModal.views?.length === 0 ? (
                  <p className="text-[10px] text-gray-500">No read receipts captured yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {detailsModal.views?.map((view, i) => (
                      <span key={i} className="text-[9px] bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded" title={`Read at: ${new Date(view.viewedAt).toLocaleString()}`}>
                        {view.user?.username} ({view.user?.role})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comments Threaded System */}
            {detailsModal.commentsEnabled ? (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageCircle size={12} />
                  <span>Q&A Discussion Panel ({comments.length})</span>
                </h4>

                {/* List Comments */}
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 mb-4">
                  {comments.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No questions posted yet. Start the Q&A thread below!</p>
                  ) : (
                    comments.map(c => (
                      <div key={c._id} className="p-3 bg-gray-900/30 border border-gray-800/40 rounded-2xl flex items-start gap-2 justify-between">
                        <div className="flex gap-2">
                          <img
                            src={c.author?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                            alt={c.author?.username}
                            className="w-6 h-6 rounded-full object-cover border border-gray-800 mt-0.5"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-white">{c.author?.username}</span>
                              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-950/30 border border-indigo-500/10 text-indigo-400">{c.author?.role}</span>
                            </div>
                            <p className="text-xs text-gray-300 mt-1 leading-relaxed">{c.content}</p>
                          </div>
                        </div>

                        {/* Delete comment moderation */}
                        {(user.role === 'admin' || 
                          c.author?._id === user._id || 
                          detailsModal.author?._id === user._id) && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Post comment form */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your question or Q&A response..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
                  >
                    Post
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-3 bg-gray-950/40 border border-gray-800 rounded-2xl flex items-center justify-center gap-2 text-xs text-gray-500">
                <AlertCircle size={14} />
                <span>Comments and Q&A have been disabled for this broadcast announcement.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CREATE & EDIT OVERLAY MODAL FORM */}
      {(createModal || editModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={createModal ? handleCreateAnnouncement : handleUpdateAnnouncement}
            className="w-full max-w-2xl glass-panel max-h-[85vh] overflow-y-auto p-6 rounded-3xl border border-gray-800 shadow-2xl relative scrollbar-thin space-y-4"
          >
            {/* Close */}
            <button
              type="button"
              onClick={() => {
                setCreateModal(false);
                setEditModal(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl border border-gray-800 bg-gray-900/30 hover:text-white text-gray-400"
            >
              <X size={16} />
            </button>

            <h2 className="text-md font-bold text-white border-b border-gray-800 pb-3 flex items-center gap-2">
              <FileText className="text-indigo-400" size={18} />
              <span>{createModal ? 'Draft New Announcement' : 'Edit Announcement Details'}</span>
            </h2>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Bulletin Title</label>
              <input
                type="text"
                placeholder="e.g. Grade 9 Midterm Exam Schedules"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                required
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Detailed Message Body</label>
              <textarea
                placeholder="Use clear messaging... (supports markdown formatting like **bold** and *italics*)"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none font-sans leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category Tag</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                  required
                >
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>

              {/* Priority Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Priority Level</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Pinned Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pin Announcement?</label>
                <select
                  value={formData.isPinned}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.value === 'true' }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="false">No (Normal feed sorting)</option>
                  <option value="true">Yes (Stick to top of page)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800/40 pt-4">
              {/* Target Audience Select */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Audience</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                  required
                >
                  <option value="all">Whole School</option>
                  <option value="grade">Specific Grade Level</option>
                  <option value="class">Specific Class</option>
                </select>
              </div>

              {/* Target Value input */}
              {formData.targetAudience !== 'all' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Target Value</label>
                  <input
                    type="text"
                    placeholder={formData.targetAudience === 'grade' ? 'e.g. Grade 9' : 'e.g. Class 9-A'}
                    value={formData.targetValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                    required
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-800/40 pt-4">
              {/* Publish Date (Scheduling) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Publish Date (Scheduling)</label>
                <input
                  type="datetime-local"
                  value={formData.publishAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishAt: e.target.value }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {/* Event Date (Calendar integration) */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Event Date (Calendar Sync)</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800/40 pt-4">
              {/* Parent Consent slip check */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Parent Consent Slip Required?</label>
                <select
                  value={formData.signatureRequired}
                  onChange={(e) => setFormData(prev => ({ ...prev, signatureRequired: e.target.value === 'true' }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="false">No Signature Required</option>
                  <option value="true">Yes, Signature Box Prompt Required</option>
                </select>
              </div>

              {/* Comments Toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Q&A Comments Panel Enabled?</label>
                <select
                  value={formData.commentsEnabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, commentsEnabled: e.target.value === 'true' }))}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                >
                  <option value="true">Enabled (Accept student/parent Q&As)</option>
                  <option value="false">Disabled (Announcement only)</option>
                </select>
              </div>
            </div>

            {/* File attachments input */}
            <div className="border-t border-gray-800/40 pt-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Paperclip size={12} />
                <span>Upload PDF/Image File Attachments (Supports up to 5 files)</span>
              </label>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="block w-full px-3 py-2 bg-gray-900 border border-gray-850 rounded-xl text-xs text-gray-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-6 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
            >
              {createModal ? 'Publish Announcement Bulletin' : 'Save Announcement Changes'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Announcements;
