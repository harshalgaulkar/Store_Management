import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';
import { User, Mail, MapPin, Key, Phone, ArrowLeft, CheckCircle2, XCircle, Shield, Store } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  
  const roles = [
    { id: 'Normal', label: 'User', icon: User },
    { id: 'Store Owner', label: 'Store Owner', icon: Store },
    { id: 'Admin', label: 'Admin', icon: Shield }
  ];

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    address: '', 
    phone: '',
    role: 'Normal'
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live validation feedback states
  const isNameValid = formData.name.length >= 20 && formData.name.length <= 60;
  const isAddressValid = formData.address.length > 0 && formData.address.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  
  // Password validation
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const isLengthValid = formData.password.length >= 8 && formData.password.length <= 16;
  const isPasswordValid = hasUppercase && hasSpecialChar && isLengthValid;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters.');
      setIsSubmitting(false);
      return;
    }
    if (!isEmailValid) {
      setError('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }
    if (!isAddressValid) {
      setError('Address must not be empty and under 400 characters.');
      setIsSubmitting(false);
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be 8-16 characters, containing at least one uppercase letter and one special character.');
      setIsSubmitting(false);
      return;
    }

    try {
      let registerPath = '/users/register';
      if (formData.role === 'Admin') {
        registerPath = '/admins/register';
      } else if (formData.role === 'Store Owner') {
        registerPath = '/store-owners/register';
      }

      const response = await API.post(registerPath, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        phone: formData.phone || 'N/A',
        role: formData.role
      });

      if (response.data.status === 'success' || response.data.success) {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } else {
        setError(response.data.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Server connection error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse duration-5000"></div>

      <div className="max-w-md w-full space-y-8 bg-zinc-900/60 backdrop-blur-xl p-8 rounded-2xl border border-zinc-800 shadow-2xl relative z-10 transition-all duration-300 hover:border-zinc-700">
        <div>
          <Link to="/login" className="inline-flex items-center text-xs font-semibold text-zinc-400 hover:text-orange-400 transition-colors mb-4">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Sign In
          </Link>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="mt-2 text-sm text-zinc-400 font-medium">Join StoreCenter as a {formData.role === 'Normal' ? 'Normal User' : formData.role}</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {/* Role selector buttons */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Register As</label>
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
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-855'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    {role.label}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between items-center mb-1">
              <span>Full Name</span>
              <span className={`text-[10px] ${isNameValid ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {formData.name.length}/60 chars (min 20)
              </span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                name="name"
                type="text"
                required
                className={`w-full bg-black/80 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 ${
                  formData.name.length === 0 
                    ? 'border-zinc-850 focus:border-orange-500 focus:ring-orange-500' 
                    : isNameValid 
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                      : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                }`}
                placeholder="Johnathan Doe Junior II"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                name="email"
                type="email"
                required
                className={`w-full bg-black/80 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 ${
                  formData.email.length === 0 
                    ? 'border-zinc-855 focus:border-orange-500 focus:ring-orange-500' 
                    : isEmailValid 
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                      : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                }`}
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                name="phone"
                type="text"
                className="w-full bg-black/80 border border-zinc-850 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-205"
                placeholder="1234567890"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between items-center mb-1">
              <span>Address</span>
              <span className={`text-[10px] ${isAddressValid ? 'text-emerald-400' : 'text-zinc-500'}`}>
                {formData.address.length}/400 max
              </span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
              <textarea
                name="address"
                required
                rows="2"
                className={`w-full bg-black/80 border rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 resize-none ${
                  formData.address.length === 0 
                    ? 'border-zinc-850 focus:border-orange-500 focus:ring-orange-500' 
                    : isAddressValid 
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                      : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                }`}
                placeholder="123 Main Street, Suite 100"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                name="password"
                type="password"
                required
                className={`w-full bg-black/80 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 ${
                  formData.password.length === 0 
                    ? 'border-zinc-855 focus:border-orange-500 focus:ring-orange-500' 
                    : isPasswordValid 
                      ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                      : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                }`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            {/* Password strength checklist */}
            <div className="mt-2 bg-black/50 p-3 rounded-lg border border-zinc-850 space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Password Strength Checklist</span>
              <div className="flex items-center text-xs">
                {isLengthValid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <XCircle className="w-3.5 h-3.5 text-zinc-500 mr-1.5" />}
                <span className={isLengthValid ? 'text-emerald-400' : 'text-zinc-400'}>8 - 16 characters</span>
              </div>
              <div className="flex items-center text-xs">
                {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <XCircle className="w-3.5 h-3.5 text-zinc-500 mr-1.5" />}
                <span className={hasUppercase ? 'text-emerald-400' : 'text-zinc-400'}>At least one uppercase letter</span>
              </div>
              <div className="flex items-center text-xs">
                {hasSpecialChar ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <XCircle className="w-3.5 h-3.5 text-zinc-500 mr-1.5" />}
                <span className={hasSpecialChar ? 'text-emerald-400' : 'text-zinc-400'}>At least one special character</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-xs font-medium text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-orange-600 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 shadow-lg shadow-orange-600/20 mt-2"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

          <div className="text-center">
            <span className="text-sm text-zinc-400">Already have an account? </span>
            <Link to="/login" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
