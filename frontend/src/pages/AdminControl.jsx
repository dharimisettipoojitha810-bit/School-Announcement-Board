import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Sliders, 
  Users, 
  Upload, 
  Trash2, 
  Plus, 
  List, 
  MessageSquare, 
  Mail, 
  ShieldAlert, 
  Check, 
  FileText,
  AlertTriangle
} from 'lucide-react';

const AdminControl = () => {
  const { user, showToast } = useAuth();
  const [categories, setCategories] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk CSV import states
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState(null);

  // Category creation states
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  // Emergency SMS states
  const [smsMessage, setSmsMessage] = useState('EMERGENCY ALERT: Extreme weather forecast. All campuses closed tomorrow, May 22. Shift to virtual portals.');
  const [smsTriggering, setSmsTriggering] = useState(false);
  const [smsLogs, setSmsLogs] = useState([]);

  // Daily Digest states
  const [digestTriggering, setDigestTriggering] = useState(false);
  const [digestLogs, setDigestLogs] = useState([]);

  // Active panel tab ('logs', 'csv', 'categories', 'emergency')
  const [activeTab, setActiveTab] = useState('logs');

  const loadData = async () => {
    setLoading(true);
    try {
      const catRes = await api.categories.getAll();
      setCategories(catRes.data);

      const logsRes = await api.auditLogs.getAll();
      setAuditLogs(logsRes.data);
    } catch (error) {
      showToast('Error loading administrative logs: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user]);

  const handleBulkCSVImport = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return showToast('Please paste CSV contents first', 'error');

    try {
      const res = await api.auth.bulkImport(csvText);
      setImportResult(res.data);
      showToast(`Bulk Import complete: ${res.data.importedCount} users imported successfully.`);
      setCsvText('');
      loadData(); // reload audit logs
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      const res = await api.categories.create({
        name: newCatName,
        description: newCatDesc,
        colorHex: newCatColor
      });
      setCategories(prev => [...prev, res.data]);
      showToast('Category tag created successfully');
      setNewCatName('');
      setNewCatDesc('');
      setNewCatColor('#6366F1');
      loadData(); // reload logs
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Announcements linked to this category might lose tagging details.')) return;
    try {
      await api.categories.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      showToast('Category deleted successfully');
      loadData(); // reload logs
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const triggerEmergencySMS = async () => {
    if (!smsMessage.trim()) return;
    setSmsTriggering(true);
    
    // Simulate Twilio API broadcast
    const logId = Date.now();
    setSmsLogs(prev => [`[${new Date().toLocaleTimeString()}] Querying Twilio SMS gateway API client...`, ...prev]);
    await new Promise(r => setTimeout(r, 1200));
    setSmsLogs(prev => [`[${new Date().toLocaleTimeString()}] Authenticating Twilio Account SID & Auth Token...`, ...prev]);
    await new Promise(r => setTimeout(r, 1000));
    setSmsLogs(prev => [`[${new Date().toLocaleTimeString()}] Dispatching bulk broadcasts to 32 registered parent telephone numbers...`, ...prev]);
    await new Promise(r => setTimeout(r, 1500));
    setSmsLogs(prev => [`[${new Date().toLocaleTimeString()}] SUCCESS: Emergency text alerts sent. Gateway response code: 200 OK.`, ...prev]);
    
    // Simulate trigger browser push notification
    if (Notification.permission === 'granted') {
      new Notification('EMERGENCY BROADCAST DIALED', {
        body: smsMessage,
        icon: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      });
    } else {
      showToast('Simulated SMS alert triggered: parents alerted!', 'success');
    }
    
    setSmsTriggering(false);
  };

  const triggerDailyDigest = async () => {
    setDigestTriggering(true);
    setDigestLogs(prev => [`[${new Date().toLocaleTimeString()}] Crawling active announcements for 2026-05-21...`, ...prev]);
    await new Promise(r => setTimeout(r, 1200));
    setDigestLogs(prev => [`[${new Date().toLocaleTimeString()}] Found 5 active announcements. Creating HTML newsletter layouts...`, ...prev]);
    await new Promise(r => setTimeout(r, 1000));
    setDigestLogs(prev => [`[${new Date().toLocaleTimeString()}] Queueing daily digest reports for 144 registered school parent emails...`, ...prev]);
    await new Promise(r => setTimeout(r, 1500));
    setDigestLogs(prev => [`[${new Date().toLocaleTimeString()}] SUCCESS: Daily summary email campaigns queued. Mailing service: NodeMailer SMTP.`, ...prev]);
    
    showToast('Daily summary digest campaign triggered successfully', 'success');
    setDigestTriggering(false);
  };

  const getTabBadgeColor = (tabName) => {
    return activeTab === tabName 
      ? 'bg-indigo-600 border border-indigo-500/30 text-white'
      : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/40';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-5">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="text-indigo-400" />
          <span>System Control Center</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Manage categories, bulk import accounts, configure gateways, and inspect logs.</p>
      </div>

      {/* Admin tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-3">
        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${getTabBadgeColor('logs')}`}>
          Security Audit Logs
        </button>
        <button onClick={() => setActiveTab('csv')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${getTabBadgeColor('csv')}`}>
          CSV Bulk User Import
        </button>
        <button onClick={() => setActiveTab('categories')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${getTabBadgeColor('categories')}`}>
          Board Categories Editor
        </button>
        <button onClick={() => setActiveTab('emergency')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${getTabBadgeColor('emergency')}`}>
          SMS & Digests Gateways
        </button>
      </div>

      {/* TAB PANELS RENDERING */}
      {activeTab === 'logs' && (
        <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
          <div className="flex items-center gap-2 mb-2 border-b border-gray-800/60 pb-3">
            <ShieldAlert className="text-red-400" />
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">System-Wide Security Audit Logs</h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Continuous ledger recording all logins, creations, modifications, and imports.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800/60 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-2">Action Code</th>
                  <th className="pb-3 pr-2">Description</th>
                  <th className="pb-3 pr-2">Audited User</th>
                  <th className="pb-3 pr-2">IP Address</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-900/10 text-gray-300">
                    <td className="py-3 font-semibold text-indigo-400 font-mono tracking-wide pr-2">{log.action}</td>
                    <td className="py-3 pr-2 leading-relaxed">{log.description}</td>
                    <td className="py-3 pr-2 font-medium">{log.user?.username || 'System Engine'} ({log.user?.role || 'Guest'})</td>
                    <td className="py-3 pr-2 font-mono text-[10px] text-gray-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 text-right font-mono text-[10px] text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'csv' && (
        <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <Users className="text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Bulk-Import Student/Parent/Teacher CSV Accounts</h3>
              <p className="text-[10px] text-gray-500">Rapidly seed multiple institutional profiles at the start of semesters.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <form onSubmit={handleBulkCSVImport} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Paste CSV Raw Data (Include Header)</label>
                  <textarea
                    placeholder="username,email,password,role,gradeLevel,classes&#10;Alice Green,alice@school.com,pass123,student,Grade 9,Class 9-A&#10;Bob Smith,bob@school.com,pass123,student,Grade 10,Class 10-A"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    rows={8}
                    className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none font-mono"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
                >
                  <Upload size={14} />
                  <span>Execute Bulk Import Ingestion</span>
                </button>
              </form>

              {importResult && (
                <div className="p-4 bg-gray-900/40 border border-gray-800 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <Check className="text-emerald-400" size={14} />
                    <span>Import Processing Report</span>
                  </h4>
                  <p className="text-[11px] text-gray-400">Successfully created **{importResult.importedCount}** new accounts.</p>
                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="text-[10px] text-red-400 font-bold uppercase">Errors/Failures ({importResult.errors.length})</p>
                      <div className="bg-red-950/20 border border-red-500/10 p-2 rounded max-h-24 overflow-y-auto text-[9px] font-mono text-red-300">
                        {importResult.errors.map((e, idx) => <p key={idx}>{e}</p>)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Instruction panel */}
            <div className="p-4 bg-indigo-950/10 border border-indigo-500/15 rounded-2xl text-xs space-y-3">
              <h4 className="font-bold text-indigo-400 flex items-center gap-1">
                <FileText size={14} />
                <span>CSV Row Formats Checklist</span>
              </h4>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                Ensure your column layout contains these exactly:
                <br />
                <code className="text-white font-mono text-[10px] bg-gray-900 px-1 py-0.5 rounded">username,email,password,role,gradeLevel,classes</code>
              </p>
              <div className="text-[11px] space-y-2 text-gray-500">
                <p>• **role**: must be `student`, `parent`, or `teacher`</p>
                <p>• **gradeLevel**: e.g. `Grade 9` (Only for student/parent)</p>
                <p>• **classes**: separate multiples with a semicolon (`;`), e.g. `Class 9-A;Class 9-B`</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
            <List className="text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Board Categories Administration</h3>
              <p className="text-[10px] text-gray-500">Manage tags, visual badges, and background colors across the feeds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Category creation */}
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Create Category Tag</h4>
              
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sports, Clubs"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Badge Color Hex</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-10 h-8 bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Summarize category purpose..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  rows={3}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                <Plus size={14} />
                <span>Save Category Badge</span>
              </button>
            </form>

            {/* Category lists */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Existing Badges ({categories.length})</h4>
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <div key={cat._id} className="p-3 bg-gray-900/30 border border-gray-800/80 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div style={{ backgroundColor: cat.colorHex }} className="w-3 h-3 rounded-full border border-white/10" />
                      <div>
                        <span className="text-xs font-bold text-white">{cat.name}</span>
                        <p className="text-[10px] text-gray-500 mt-0.5">{cat.description || 'No description provided.'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat._id)}
                      className="text-gray-500 hover:text-red-400 p-1.5 border border-gray-800 bg-gray-900/30 hover:border-red-500/20 rounded-xl transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SMS twilio alert broadcast */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <MessageSquare className="text-red-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Twilio SMS Alert Broadcast Gateway</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Send urgent text updates directly to parent mobile numbers.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Broadcast Text Message</label>
                <textarea
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-white focus:outline-none"
                  required
                />
              </div>

              <button
                onClick={triggerEmergencySMS}
                disabled={smsTriggering}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
              >
                {smsTriggering ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldAlert size={14} />
                    <span>Trigger SMS Emergency Broadcast</span>
                  </>
                )}
              </button>

              {/* Twilio live simulation console */}
              {smsLogs.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Gateway Output Terminal</p>
                  <div className="bg-gray-950 border border-gray-900 rounded-xl p-3 max-h-40 overflow-y-auto text-[9px] font-mono text-emerald-400 space-y-1 leading-relaxed">
                    {smsLogs.map((log, i) => <p key={i}>{log}</p>)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily summary email digests trigger */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Mail className="text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Daily Digest Mail Campaigns</h3>
                <p className="text-[10px] text-gray-500 mt-0.5">Aggregate board updates for parents who digest bulletins daily.</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Automated mailing campaign grabs all announcements created during the current date and structures them into a sleek school newsletter.
              </p>

              <button
                onClick={triggerDailyDigest}
                disabled={digestTriggering}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                {digestTriggering ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Mail size={14} />
                    <span>Run Daily Digest Newsletter</span>
                  </>
                )}
              </button>

              {/* Digest live simulation console */}
              {digestLogs.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Mailing Output Terminal</p>
                  <div className="bg-gray-950 border border-gray-900 rounded-xl p-3 max-h-40 overflow-y-auto text-[9px] font-mono text-indigo-400 space-y-1 leading-relaxed">
                    {digestLogs.map((log, i) => <p key={i}>{log}</p>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControl;
