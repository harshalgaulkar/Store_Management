import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { LogOut, Star, Key, Calendar, Mail, User, ShieldAlert, ArrowUpDown, ChevronDown, ChevronUp, Check, Store, MapPin } from 'lucide-react';

const OwnerDashboard = () => {
  const { user, logout, showToast } = useAuth();
  
  // Dashboard states
  const [ownerStore, setOwnerStore] = useState(null);
  const [storeAvg, setStoreAvg] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Store creation states
  const [storeForm, setStoreForm] = useState({ store_name: '', store_email: '', store_address: '' });
  const [storeFormError, setStoreFormError] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Store validations
  const isStoreEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeForm.store_email);
  const isStoreNameValid = storeForm.store_name.trim().length > 0;
  const isStoreAddressValid = storeForm.store_address.trim().length > 0 && storeForm.store_address.length <= 400;

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at'); // 'user_name', 'user_email', 'rating_value', 'created_at'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Password Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Live password validation
  const hasUppercase = /[A-Z]/.test(passwords.newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(passwords.newPassword);
  const isLengthValid = passwords.newPassword.length >= 8 && passwords.newPassword.length <= 16;
  const isNewPasswordValid = hasUppercase && hasSpecialChar && isLengthValid;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Query if this owner has a store registered
      const storeRes = await API.get(`/stores/owner/${user.id}`);
      if (storeRes.data.status === 'success' && storeRes.data.data !== null) {
        setOwnerStore(storeRes.data.data);
        
        // Fetch average rating
        const avgResponse = await API.get('/store-owners/ratings/average', {
          params: { uid: user.id }
        });
        
        // Fetch list of ratings with user details
        const listResponse = await API.get('/store-owners/ratings', {
          params: { uid: user.id }
        });

        if (avgResponse.data.status === 'success' && listResponse.data.status === 'success') {
          setStoreAvg(avgResponse.data.data[0] || null);
          setRatings(listResponse.data.data);
        } else {
          setError('Failed to fetch dashboard metrics.');
        }
      } else {
        setOwnerStore(null);
        setStoreAvg(null);
        setRatings([]);
      }
    } catch (err) {
      console.error(err);
      setError('Connection failed. Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const handleStoreCreateSubmit = async (e) => {
    e.preventDefault();
    setStoreFormError('');

    if (!isStoreNameValid) {
      setStoreFormError('Store Name is required.');
      return;
    }
    if (!isStoreEmailValid) {
      setStoreFormError('Please enter a valid store email address.');
      return;
    }
    if (!isStoreAddressValid) {
      setStoreFormError('Store Address is required and must be under 400 characters.');
      return;
    }

    setIsCreatingStore(true);
    try {
      const response = await API.post('/stores/add', {
        owner_id: user.id,
        store_name: storeForm.store_name,
        store_email: storeForm.store_email,
        store_address: storeForm.store_address
      });

      if (response.data.status === 'success' || response.data.success) {
        showToast('Store profile created successfully!', 'success');
        setStoreForm({ store_name: '', store_email: '', store_address: '' });
        fetchDashboardData();
      } else {
        setStoreFormError(response.data.error || 'Failed to register store.');
      }
    } catch (err) {
      console.error(err);
      setStoreFormError('Server error creating store.');
    } finally {
      setIsCreatingStore(false);
    }
  };

  const handleStoreFormChange = (e) => {
    setStoreForm({ ...storeForm, [e.target.name]: e.target.value });
    setStoreFormError('');
  };

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(field);
  };

  const getSortedRatings = () => {
    return [...ratings].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'rating_value') {
        valA = parseFloat(valA || 0);
        valB = parseFloat(valB || 0);
      } else if (sortBy === 'created_at') {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Password update
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!isNewPasswordValid) {
      setPasswordError('New password does not meet requirements.');
      return;
    }
    setIsUpdatingPassword(true);
    setPasswordError('');

    try {
      const response = await API.put('/store-owners/update-password', {
        uid: user.id,
        old_password: passwords.oldPassword,
        new_password: passwords.newPassword
      });
      if (response.data.status === 'success') {
        showToast('Password updated successfully!', 'success');
        setPasswords({ oldPassword: '', newPassword: '' });
        setIsPasswordModalOpen(false);
      } else {
        setPasswordError(response.data.error || 'Incorrect old password.');
      }
    } catch (err) {
      console.error(err);
      setPasswordError('Server connection error.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Helper render sort icon
  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-zinc-500" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-orange-400" />
      : <ChevronDown className="w-3.5 h-3.5 ml-1 text-orange-400" />;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-zinc-900/60 backdrop-blur-md border-b border-zinc-850 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">StoreCenter</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">Owner</span>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-sm text-zinc-400 hidden lg:block">
                Welcome, <span className="font-semibold text-zinc-200">{user?.name}</span>
              </span>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-2.5 py-1.5 border border-zinc-700 text-xs font-semibold rounded-lg hover:border-zinc-500 hover:bg-zinc-855 transition-all flex items-center text-zinc-350"
                title="Change Password"
              >
                <Key className="w-3.5 h-3.5 md:mr-1.5" />
                <span className="hidden md:inline">Change Password</span>
              </button>
              <button
                onClick={logout}
                className="px-2.5 py-1.5 bg-rose-650 hover:bg-rose-500 text-xs font-semibold rounded-lg transition-all flex items-center text-white"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 md:mr-1.5" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center text-rose-400 text-sm">
            <ShieldAlert className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : ownerStore === null ? (
          <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-850 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20 mx-auto text-orange-400">
                <Store className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-white">Setup Your Store Profile</h1>
              <p className="text-xs text-zinc-400">
                You haven't registered your store profile yet. Fill in the details below to create your store and start tracking ratings.
              </p>
            </div>

            <form onSubmit={handleStoreCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Store Name</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    name="store_name"
                    type="text"
                    required
                    className={`w-full bg-black/80 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 ${
                      storeForm.store_name.length === 0 
                        ? 'border-zinc-800 focus:border-orange-500 focus:ring-orange-500' 
                        : isStoreNameValid 
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                          : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                    }`}
                    placeholder="Super Market Premium A"
                    value={storeForm.store_name}
                    onChange={handleStoreFormChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Store Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    name="store_email"
                    type="email"
                    required
                    className={`w-full bg-black/80 border rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 ${
                      storeForm.store_email.length === 0 
                        ? 'border-zinc-800 focus:border-orange-500 focus:ring-orange-500' 
                        : isStoreEmailValid 
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                          : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                    }`}
                    placeholder="contact@store.com"
                    value={storeForm.store_email}
                    onChange={handleStoreFormChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex justify-between items-center mb-1">
                  <span>Store Address</span>
                  <span className={`text-[10px] ${isStoreAddressValid ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {storeForm.store_address.length}/400 max
                  </span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
                  <textarea
                    name="store_address"
                    required
                    rows="3"
                    className={`w-full bg-black/80 border rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all duration-200 resize-none ${
                      storeForm.store_address.length === 0 
                        ? 'border-zinc-800 focus:border-orange-500 focus:ring-orange-500' 
                        : isStoreAddressValid 
                          ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500' 
                          : 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500'
                    }`}
                    placeholder="200 Commerce Blvd, Suite A"
                    value={storeForm.store_address}
                    onChange={handleStoreFormChange}
                  />
                </div>
              </div>

              {storeFormError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-xs text-rose-400">
                  {storeFormError}
                </div>
              )}

              <button
                type="submit"
                disabled={isCreatingStore}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold rounded-xl text-white shadow-lg shadow-orange-600/20 transition-all active:scale-95"
              >
                {isCreatingStore ? 'Creating Store Profile...' : 'Register Store Profile'}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Header / Metric Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Welcome/Store Banner */}
              <div className="md:col-span-2 p-6 bg-gradient-to-r from-orange-950/20 via-zinc-900/60 to-amber-950/20 rounded-2xl border border-orange-950/30 shadow-xl flex flex-col justify-center">
                <h1 className="text-3xl font-extrabold text-white">
                  {ownerStore ? ownerStore.store_name : 'Your Store'}
                </h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Track user reviews, monitor ratings feedback, and manage your overall ranking profile.
                </p>
              </div>

              {/* Average Rating Widget */}
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-850 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">Average Store Rating</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-5xl font-black text-white">
                    {storeAvg?.avg_rating ? parseFloat(storeAvg.avg_rating).toFixed(1) : '0.0'}
                  </span>
                  <span className="text-sm text-zinc-500">/ 5.0</span>
                </div>
                <div className="flex items-center space-x-1 mt-3">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avg = parseFloat(storeAvg?.avg_rating || 0);
                    return (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(avg) 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-zinc-800'
                        }`}
                      />
                    );
                  })}
                  <span className="text-xs text-zinc-400 ml-1.5">({ratings.length} ratings)</span>
                </div>
              </div>
            </div>

            {/* Ratings List Table */}
            <div className="bg-zinc-900 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl">
              <div className="p-6 border-b border-zinc-850 bg-zinc-900/50 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-white">Customer Reviews</h2>
                  <p className="text-xs text-zinc-400 mt-1">Reviewers and ratings submitted for your store.</p>
                </div>
              </div>

              {ratings.length === 0 ? (
                <div className="text-center py-20 bg-zinc-950/20">
                  <p className="text-zinc-500 text-sm italic">No user ratings submitted for your store yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 bg-black/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                        <th 
                          onClick={() => handleSort('user_name')}
                          className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center">
                            User Name
                            {renderSortIcon('user_name')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('user_email')}
                          className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center">
                            Email
                            {renderSortIcon('user_email')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('rating_value')}
                          className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center justify-center">
                            Rating Value
                            {renderSortIcon('rating_value')}
                          </div>
                        </th>
                        <th 
                          onClick={() => handleSort('created_at')}
                          className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                        >
                          <div className="flex items-center">
                            Date Submitted
                            {renderSortIcon('created_at')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850 text-sm">
                      {getSortedRatings().map((rating, index) => (
                        <tr 
                          key={index} 
                          className="hover:bg-zinc-900/20 transition-colors"
                        >
                          <td className="px-6 py-4 text-zinc-200 font-semibold flex items-center">
                            <div className="h-7 w-7 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mr-3 text-xs font-bold uppercase">
                              {rating.user_name?.charAt(0)}
                            </div>
                            {rating.user_name}
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            <div className="flex items-center">
                              <Mail className="w-3.5 h-3.5 text-zinc-650 mr-2" />
                              {rating.user_email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-bold text-xs">
                              <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
                              {rating.rating_value}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-zinc-400">
                            <div className="flex items-center">
                              <Calendar className="w-3.5 h-3.5 text-zinc-650 mr-2" />
                              {new Date(rating.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Update Password</h3>
              <p className="text-xs text-zinc-400 mt-1">Configure your login credentials security.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Old Password</label>
                <input
                  name="oldPassword"
                  type="password"
                  required
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
                  placeholder="••••••••"
                  value={passwords.oldPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">New Password</label>
                <input
                  name="newPassword"
                  type="password"
                  required
                  className="w-full bg-black border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all duration-200"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>

              {/* Password strength requirements list */}
              <div className="bg-black/50 p-3 rounded-lg border border-zinc-850 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Password Requirements</span>
                <div className="flex items-center text-xs">
                  {isLengthValid ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-2.5 ml-1"></div>}
                  <span className={isLengthValid ? 'text-emerald-400' : 'text-zinc-400'}>8 - 16 characters</span>
                </div>
                <div className="flex items-center text-xs">
                  {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-2.5 ml-1"></div>}
                  <span className={hasUppercase ? 'text-emerald-400' : 'text-zinc-400'}>At least one uppercase letter</span>
                </div>
                <div className="flex items-center text-xs">
                  {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> : <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full mr-2.5 ml-1"></div>}
                  <span className={hasSpecialChar ? 'text-emerald-400' : 'text-zinc-400'}>At least one special character</span>
                </div>
              </div>

              {passwordError && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
                  {passwordError}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="flex-1 py-2.5 border border-zinc-700 hover:border-zinc-500 text-xs font-semibold rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword || !isNewPasswordValid}
                  className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold rounded-xl text-white shadow-lg shadow-orange-600/20 transition-all"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
