import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, PlusCircle, ArrowLeft } from 'lucide-react';

const Register = () => {
  const { register, showToast } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [gradeLevel, setGradeLevel] = useState('');
  const [classesStr, setClassesStr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !role) {
      return showToast('Please fill out all required fields', 'error');
    }

    setLoading(true);
    try {
      const classes = classesStr 
        ? classesStr.split(',').map(c => c.trim()) 
        : [];
      
      await register({
        username,
        email: email.trim().toLowerCase(),
        password,
        role,
        gradeLevel,
        classes
      });
      navigate('/login');
    } catch (error) {
      // Handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur BG */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-3xl -z-10" />

      {/* Register Glass Panel */}
      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-gray-800 shadow-2xl relative">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 text-white font-extrabold text-2xl mb-4">
            S
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Create Account</h2>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-semibold">Join the Announcement Board</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Alex Green"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

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
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="block w-full pl-10 pr-3 py-2 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="block w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {(role === 'student' || role === 'parent') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-800/50 pt-4 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Grade Level</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 9"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="block w-full px-3 py-2 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Enrolled Classes (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Class 9-A, Class 9-B"
                  value={classesStr}
                  onChange={(e) => setClassesStr(e.target.value)}
                  className="block w-full px-3 py-2 bg-gray-900/40 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <PlusCircle size={16} />
                <span>Create Profile</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400 border-t border-gray-800/60 pt-4">
          Already have a profile?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold">
            <ArrowLeft size={10} />
            <span>Go to Log In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
