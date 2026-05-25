import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  Megaphone, 
  Calendar as CalendarIcon, 
  Bookmark, 
  Users, 
  AlertTriangle, 
  Eye, 
  CheckSquare, 
  TrendingUp,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const [feed, setFeed] = useState([]);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const feedRes = await api.announcements.getFeed();
        setFeed(feedRes.data);

        const eventRes = await api.announcements.getCalendar();
        // Sort events by date
        const sortedEvents = eventRes.data.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
        setEvents(sortedEvents);

        if (user.role === 'admin' || user.role === 'teacher') {
          const analyticsRes = await api.announcements.getAnalytics();
          setAnalytics(analyticsRes.data);
        }

        if (user.role === 'admin') {
          const auditRes = await api.auditLogs.getAll();
          setAuditLogs(auditRes.data.slice(0, 5)); // show latest 5
        }
      } catch (error) {
        console.error('Failed to load dashboard parameters', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Filter urgent pinned alerts
  const urgentAlerts = feed.filter(a => a.priority === 'urgent');
  const pinnedAlerts = feed.filter(a => a.isPinned && a.priority !== 'urgent');
  const recentFeed = feed.slice(0, 3);

  // SVG Chart Computations for Analytics
  const renderSVGChart = () => {
    if (analytics.length === 0) return <p className="text-sm text-gray-500">No analytics data seeded yet.</p>;

    const maxViews = Math.max(...analytics.map(a => a.viewsCount), 5); // cap default floor
    const chartHeight = 160;
    const barWidth = 35;
    const gap = 20;

    return (
      <div className="overflow-x-auto py-2">
        <svg width={analytics.length * (barWidth + gap) + 40} height={chartHeight + 40} className="mx-auto">
          {analytics.map((item, idx) => {
            const barHeight = (item.viewsCount / maxViews) * chartHeight;
            const x = idx * (barWidth + gap) + 20;
            const y = chartHeight - barHeight + 20;

            const sigHeight = item.signatureRequired ? (item.signaturesCount / maxViews) * chartHeight : 0;
            const ySig = chartHeight - sigHeight + 20;

            return (
              <g key={idx} className="group">
                {/* Views Bar (Indigo) */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#indigoGrad)"
                  rx="6"
                  className="transition-all duration-300 hover:opacity-85"
                />
                
                {/* Signature Bar (Cyan Overlay) */}
                {item.signatureRequired && (
                  <rect
                    x={x + 8}
                    y={ySig}
                    width={barWidth - 16}
                    height={sigHeight}
                    fill="#06B6D4"
                    rx="3"
                    className="opacity-90"
                  />
                )}

                {/* Counts Tooltip */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fill="#A5B4FC"
                  fontSize="10"
                  fontWeight="bold"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {item.viewsCount}v {item.signatureRequired && `| ${item.signaturesCount}s`}
                </text>

                {/* X-Axis labels */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 35}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize="8"
                  fontWeight="semibold"
                >
                  {item.title.length > 7 ? `${item.title.substring(0, 7)}...` : item.title}
                </text>
              </g>
            );
          })}
          
          {/* Gradients Definitions */}
          <defs>
            <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-center gap-4 text-xs mt-2">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <div className="w-3 h-3 bg-indigo-500 rounded" />
            <span>Total Views</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <div className="w-3 h-3 bg-cyan-500 rounded" />
            <span>Digital Consent Signs</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass-card p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-gray-900/60 to-indigo-950/20">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">Welcome, {user.username}!</h1>
          <p className="text-sm text-gray-400 mt-1">Here is a summary of your active educational communications board.</p>
        </div>
        <div className="text-xs uppercase tracking-widest font-semibold px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-600/10 text-indigo-400">
          Academic Year: 2026/2027
        </div>
      </div>

      {/* Urgent Emergency Alert Banner */}
      {urgentAlerts.length > 0 && (
        <div className="p-4 rounded-2xl glow-urgent bg-red-950/40 border border-red-500/30 flex items-start gap-3 animate-pulse-slow">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">EMERGENCY BROADCAST ALERT</span>
            <h3 className="text-sm font-bold text-white mt-0.5">{urgentAlerts[0].title}</h3>
            <p className="text-xs text-red-300 mt-1 line-clamp-2">{urgentAlerts[0].content.replace(/\*\*|_/g, '')}</p>
            <Link to="/announcements" className="text-xs text-red-400 hover:underline font-bold mt-2 inline-block">
              View urgent bulletin details &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Role-Specific Metric Widgets Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {user.role === 'admin' ? (
          <>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl"><Megaphone size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Broadcasting</p><h4 className="text-lg font-bold text-white">{feed.length} Active</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl"><Users size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Grades</p><h4 className="text-lg font-bold text-white">All Schools</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"><AlertTriangle size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Emergencies</p><h4 className="text-lg font-bold text-white">{urgentAlerts.length} Warnings</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl"><TrendingUp size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Engagement</p><h4 className="text-lg font-bold text-white">88% Rate</h4></div>
            </div>
          </>
        ) : user.role === 'teacher' ? (
          <>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl"><Megaphone size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">My Alerts</p><h4 className="text-lg font-bold text-white">{feed.filter(a => a.author._id === user._id).length} Bulletins</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl"><Eye size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Views</p><h4 className="text-lg font-bold text-white">{analytics.reduce((acc, curr) => acc + curr.viewsCount, 0)} Views</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl"><CheckSquare size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Consents Filed</p><h4 className="text-lg font-bold text-white">{analytics.reduce((acc, curr) => acc + curr.signaturesCount, 0)} Signed</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"><AlertTriangle size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Urgent Warnings</p><h4 className="text-lg font-bold text-white">{urgentAlerts.length} Total</h4></div>
            </div>
          </>
        ) : (
          <>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl"><Megaphone size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Board Bulletins</p><h4 className="text-lg font-bold text-white">{feed.length} Active</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl"><CalendarIcon size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Class Schedule</p><h4 className="text-lg font-bold text-white">{events.length} Events</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl"><AlertTriangle size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Class Targets</p><h4 className="text-lg font-bold text-white">{user.gradeLevel || 'Global'}</h4></div>
            </div>
            <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-xl"><Bookmark size={20} /></div>
              <div><p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">My Bookmarks</p><h4 className="text-lg font-bold text-white">Saved</h4></div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Double Columns: Main Dynamic Feed or SVG Analytics charts */}
        <div className="lg:col-span-2 space-y-6">
          {(user.role === 'admin' || user.role === 'teacher') && (
            <div className="glass-card p-6 rounded-3xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-800/60 pb-3">
                <TrendingUp className="text-indigo-400" />
                <h3 className="text-md font-bold text-white">Engagement Dashboard Metrics</h3>
              </div>
              {renderSVGChart()}
            </div>
          )}

          {/* Recent active feed */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800/60 pb-3">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Megaphone className="text-indigo-400" size={18} />
                <span>Recent Bulletins ({recentFeed.length})</span>
              </h3>
              <Link to="/announcements" className="text-xs text-indigo-400 hover:underline">
                View bulletin board &rarr;
              </Link>
            </div>
            
            <div className="flex flex-col gap-3">
              {recentFeed.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No recent bulletins posted yet.</p>
              ) : (
                recentFeed.map(item => (
                  <div key={item._id} className="p-3 bg-gray-900/20 border border-gray-800/60 rounded-xl flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.priority === 'urgent' && <span className="text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full uppercase">Urgent</span>}
                        {item.priority === 'high' && <span className="text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase">High</span>}
                        <span className="text-[9px] font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-wider">{item.category.name}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1.5">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">Published by {item.author.username} | {new Date(item.publishAt).toLocaleDateString()}</p>
                    </div>
                    {item.signatureRequired && (
                      <span className="text-[9px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/10 px-2 py-0.5 rounded-full shrink-0">Consent Required</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Single Column: Events Calendar checklist, Audit trail or Teacher Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Event Calendar Checklist */}
          <div className="glass-card p-6 rounded-3xl border border-gray-800 shadow-xl">
            <div className="flex justify-between items-center mb-4 border-b border-gray-800/60 pb-3">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <CalendarIcon className="text-indigo-400" size={18} />
                <span>Upcoming Calendar</span>
              </h3>
              <Link to="/calendar" className="text-xs text-indigo-400 hover:underline">
                Open full calendar &rarr;
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {events.slice(0, 4).length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No upcoming events scheduled.</p>
              ) : (
                events.slice(0, 4).map(item => (
                  <div key={item._id} className="p-3 bg-gray-900/30 border border-gray-800/50 rounded-xl flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center w-10 h-10 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                      <span className="text-[9px] font-bold uppercase">{new Date(item.eventDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-sm font-extrabold">{new Date(item.eventDate).getDate()}</span>
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{item.category.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Admin Actions or Quick Audit logs */}
          {user.role === 'admin' && (
            <div className="glass-card p-6 rounded-3xl border border-gray-800 shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-gray-800/60 pb-3">
                <FileText className="text-indigo-400" size={18} />
                <h3 className="text-md font-bold text-white">Recent Security Logs</h3>
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log._id} className="text-[10px] p-2 bg-gray-900/30 border border-gray-800/50 rounded-xl space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-indigo-400 uppercase tracking-widest">{log.action}</span>
                      <span className="text-gray-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-300 leading-tight">{log.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
