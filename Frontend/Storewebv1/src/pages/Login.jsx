import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { Shield, Store, User, Key, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login, showToast } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ email: '', password: '', role: 'Normal' });

  useEffect(() => {
    if (location.state?.message) {
      showToast(location.state.message, 'success');
      window.history.replaceState({}, document.title);
    }
  }, [location.state, showToast]);

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = [
    { id: 'Normal', label: 'User', icon: User, path: '/users/login' },
    { id: 'Store Owner', label: 'Store Owner', icon: Store, path: '/store-owners/login' },
    { id: 'Admin', label: 'Admin', icon: Shield, path: '/admins/login' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      const activeRole = roles.find(r => r.id === formData.role);
      const response = await API.post(activeRole.path, {
        email: formData.email,
        password: formData.password
      });

      if (response.data.status === 'success') {
        const { token, ...userData } = response.data.data;
        
        if (!userData.role) {
          userData.role = formData.role;
        }
        
        login(userData, token);
        
        if (userData.role === 'Admin') navigate('/admin');
        else if (userData.role === 'Store Owner') navigate('/owner');
        else navigate('/user');
      } else {
        setError(response.data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Connection failed. Please check if backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentRoleIcon = () => {
    const r = roles.find(role => role.id === formData.role);
    const IconComponent = r ? r.icon : User;
    return <IconComponent className="w-12 h-12 text-orange-500" />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse duration-5000"></div>

      <div className="max-w-md w-full space-y-8 bg-zinc-900/60 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800 shadow-2xl relative z-10 transition-all duration-300 hover:border-zinc-700">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-inner mb-4 transition-transform duration-500 hover:rotate-12">
            {currentRoleIcon()}
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">StoreCenter</h2>
          <p className="mt-2 text-sm text-zinc-400">Sign in to manage ratings and stores</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Role selector buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Login As</label>
            <div className="grid grid-cols-3 gap-2 bg-black p-1.5 rounded-xl border border-zinc-850">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      formData.role === role.id 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/25' 
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Email / Password Inputs */}
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Password</label>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full bg-black/80 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 transition-all duration-200 animate-shake">
              <p className="text-xs font-medium text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg shadow-orange-600/20"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <span className="text-sm text-zinc-400">Don't have an account? </span>
            <Link to="/register" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
