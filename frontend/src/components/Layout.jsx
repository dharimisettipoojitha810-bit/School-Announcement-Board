import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Megaphone, 
  Calendar as CalendarIcon, 
  Bookmark, 
  Sliders, 
  LogOut, 
  Menu, 
  X,
  Bell
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Event Calendar', path: '/calendar', icon: CalendarIcon },
    { name: 'Bookmarks', path: '/bookmarks', icon: Bookmark },
  ];

  // Only admins can see the System Control moderation page
  if (user && user.role === 'admin') {
    navigation.push({ name: 'System Control', path: '/admin', icon: Sliders });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'teacher': return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'parent': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      default: return 'bg-sky-500/10 text-sky-400 border border-sky-500/30';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <header className="md:hidden glass-panel px-4 py-3 flex items-center justify-between z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">S</div>
          <span className="font-bold text-lg tracking-wider text-white">SCHOOL BOARD</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-300 hover:text-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:sticky top-[56px] md:top-0 h-[calc(100vh-56px)] md:h-screen w-64 glass-panel z-30 transition-transform duration-300 flex flex-col justify-between p-4 border-r border-gray-800 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div>
          {/* Logo Section */}
          <div className="hidden md:flex items-center gap-3 px-2 py-4 mb-6 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/40">S</div>
            <div>
              <h1 className="font-bold text-md tracking-wider text-white leading-tight">SCHOOL BOARD</h1>
              <span className="text-[10px] text-gray-500 tracking-widest font-semibold uppercase">Digital Portal</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-600/20 border border-indigo-500/30 text-white'
                      : 'text-gray-400 hover:bg-gray-800/40 hover:text-white border border-transparent'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account / Logout */}
        {user && (
          <div className="flex flex-col gap-4 border-t border-gray-800 pt-4">
            <div className="flex items-center gap-3 px-2">
              <img
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                alt={user.username}
                className="w-10 h-10 rounded-full border border-gray-700 object-cover"
              />
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate leading-tight">{user.username}</p>
                <span className={`text-[10px] inline-block font-bold tracking-widest uppercase mt-1 px-2 py-0.5 rounded-full ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-gray-800 bg-gray-900/40 text-gray-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all text-xs font-semibold"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar header */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-gray-800/60 glass-panel sticky top-0 z-20">
          <div>
            <h2 className="text-sm text-gray-500 font-semibold tracking-wider uppercase">
              {location.pathname === '/' ? 'Overview' : location.pathname.substring(1).replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick action buttons */}
            <button className="p-2 rounded-xl text-gray-400 hover:text-indigo-400 hover:bg-gray-800/30 transition-all relative">
              <Bell size={18} />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div className="h-6 w-[1px] bg-gray-800" />
            <div className="text-right text-xs">
              <p className="text-gray-400 font-medium">Academic Session</p>
              <p className="text-indigo-400 font-bold">2026/2027</p>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
