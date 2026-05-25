import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, loginWithSSO, showToast } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // SSO Selection modal
  const [ssoModalOpen, setSsoModalOpen] = useState(false);
  const [ssoProvider, setSsoProvider] = useState('');

  const mockSSOAccounts = [
    { name: 'Alex Green', email: 'alex@school.com', role: 'Student (Grade 9)' },
    { name: 'Emma Watson', email: 'emma@school.com', role: 'Student (Grade 10)' },
    { name: 'Mr. Davis', email: 'davis@school.com', role: 'Teacher' },
    { name: 'John Green', email: 'john@school.com', role: 'Parent' },
    { name: 'Administrator', email: 'admin@school.com', role: 'System Admin' },
  ];

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return showToast('Please enter both email and password', 'error');
    }
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      // Toast already dispatched by context
    } finally {
      setLoading(false);
    }
  };

  const triggerSSOLogin = async (selectedEmail) => {
    setSsoModalOpen(false);
    try {
      await loginWithSSO(ssoProvider, selectedEmail);
      navigate('/');
    } catch (error) {
      // Handled in context
    }
  };

  const openSSOPicker = (provider) => {
    setSsoProvider(provider);
    setSsoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Floating Circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-600/5 blur-3xl -z-10" />

      {/* Main glass box card */}
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl relative">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 text-white font-extrabold text-2xl mb-4">
            S
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">School Announcement Board</p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">School Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                <span>Log In</span>
              </>
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0B0F19] px-3 text-gray-500 font-semibold tracking-wider">Or Single Sign-On</span>
          </div>
        </div>

        {/* SSO Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => openSSOPicker('google')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900/20 text-gray-300 hover:bg-gray-800/40 transition-all text-xs font-semibold"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.664 0-8.443-3.827-8.443-8.5s3.779-8.5 8.443-8.5c2.195 0 4.114.773 5.568 2.16l3.355-3.355C18.66.96 15.688 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c5.78 0 10.97-4.114 10.97-12.24 0-.83-.07-1.42-.19-1.955H12.24z"/>
            </svg>
            <span>Google SSO</span>
          </button>

          <button
            onClick={() => openSSOPicker('microsoft')}
            className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-800 bg-gray-900/20 text-gray-300 hover:bg-gray-800/40 transition-all text-xs font-semibold"
          >
            <svg className="h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
              <path fill="#F25022" d="M0 0h11v11H0z"/>
              <path fill="#7FBA00" d="M12 0h11v11H12z"/>
              <path fill="#00A4EF" d="M0 12h11v11H0z"/>
              <path fill="#FFB900" d="M12 12h11v11H12z"/>
            </svg>
            <span>Microsoft SSO</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          Need an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline inline-flex items-center gap-0.5">
            <span>Register here</span>
            <ArrowRight size={10} />
          </Link>
        </p>

        {/* Tip section with credentials */}
        <div className="mt-8 p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/10 text-[10px] text-gray-400 leading-relaxed">
          <p className="font-semibold text-indigo-300 uppercase tracking-widest text-[9px] mb-1">Quick Testing Credentials:</p>
          <p>• **Admin**: `admin@school.com` / `password123`</p>
          <p>• **Teacher**: `davis@school.com` / `password123`</p>
          <p>• **Student**: `alex@school.com` / `password123`</p>
        </div>
      </div>

      {/* Simulated SSO Identity Picker Modal */}
      {ssoModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-gray-800 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="text-indigo-400" />
              <span>Simulated {ssoProvider === 'google' ? 'Google' : 'Microsoft'} SSO Portal</span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Select one of the pre-seeded school accounts to mock single sign-on authentication:
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
              {mockSSOAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => triggerSSOLogin(acc.email)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-800/60 bg-gray-900/30 hover:bg-indigo-600/10 hover:border-indigo-500/30 text-left transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-white leading-tight">{acc.name}</p>
                    <span className="text-[10px] text-gray-500 font-mono mt-0.5 inline-block">{acc.email}</span>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950/40 border border-indigo-500/10 px-2 py-0.5 rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setSsoModalOpen(false)}
              className="mt-6 w-full py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-400 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel SSO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
