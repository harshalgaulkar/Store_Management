import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  LogOut, Search, Star, Edit, ShieldAlert, Key, MapPin, Mail, 
  ChevronDown, ChevronUp, Check, Eye, X, Calendar, MessageSquare, AlertCircle
} from 'lucide-react';

const UserDashboard = () => {
  const { user, logout, showToast } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('store_name'); // 'store_name' or 'avg_rating'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Detailed Store Modal state (includes ratings list and rating breakdown)
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeReviews, setStoreReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Rating submission state inside the details modal
  const [ratingVal, setRatingVal] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');

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

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await API.get('/stores/all-with-user-ratings', {
        params: {
          user_id: user?.id,
          search: searchQuery
        }
      });
      if (response.data.status === 'success') {
        setStores(response.data.data);
      } else {
        setError('Failed to fetch stores.');
      }
    } catch (err) {
      console.error(err);
      setError('Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStores();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, searchQuery]);

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(field);
  };

  const getSortedStores = () => {
    return [...stores].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'avg_rating') {
        valA = parseFloat(valA || 0);
        valB = parseFloat(valB || 0);
      } else {
        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Open store details and load reviews
  const openStoreDetails = async (store) => {
    setSelectedStore(store);
    setRatingVal(store.user_rating || 5);
    setRatingError('');
    setStoreReviews([]);
    setLoadingReviews(true);

    try {
      const response = await API.get(`/ratings/store/${store.store_id}`);
      if (response.data.status === 'success') {
        setStoreReviews(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Submit/Edit rating inside details modal
  const handleRatingSubmit = async () => {
    setIsSubmittingRating(true);
    setRatingError('');
    try {
      if (selectedStore.user_rating_id) {
        // Edit existing rating
        const response = await API.put(`/ratings/update/${selectedStore.user_rating_id}`, {
          rating_value: ratingVal
        });
        if (response.data.status === 'success') {
          showToast('Rating updated successfully!', 'success');
          // Refresh store details and stores list
          const updatedStore = { ...selectedStore, user_rating: ratingVal };
          setSelectedStore(updatedStore);
          fetchStores();
          
          // Re-load reviews list
          const reviewsRes = await API.get(`/ratings/store/${selectedStore.store_id}`);
          if (reviewsRes.data.status === 'success') {
            setStoreReviews(reviewsRes.data.data);
          }
        } else {
          setRatingError(response.data.error || 'Failed to update rating.');
        }
      } else {
        // Add new rating
        const response = await API.post('/ratings/add', {
          user_id: user.id,
          store_id: selectedStore.store_id,
          rating_value: ratingVal
        });
        if (response.data.status === 'success') {
          showToast('Rating submitted successfully!', 'success');
          // Refresh list
          fetchStores();
          
          // Close and reopen details to refresh state or map user_rating_id
          const newRatingId = response.data.data.insertId;
          const updatedStore = { 
            ...selectedStore, 
            user_rating: ratingVal, 
            user_rating_id: newRatingId 
          };
          setSelectedStore(updatedStore);
          
          // Re-load reviews list
          const reviewsRes = await API.get(`/ratings/store/${selectedStore.store_id}`);
          if (reviewsRes.data.status === 'success') {
            setStoreReviews(reviewsRes.data.data);
          }
        } else {
          setRatingError(response.data.error || 'Failed to submit rating.');
        }
      }
    } catch (err) {
      console.error(err);
      setRatingError('Server error submitting rating.');
    } finally {
      setIsSubmittingRating(false);
    }
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
      const response = await API.put('/users/update-password', {
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

  // Calculate review statistics breakdown
  const getReviewBreakdown = () => {
    const total = storeReviews.length;
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (total === 0) return { breakdown, percentages: breakdown };

    storeReviews.forEach(r => {
      const val = Math.round(r.rating_value);
      if (breakdown[val] !== undefined) breakdown[val]++;
    });

    const percentages = {};
    for (let key in breakdown) {
      percentages[key] = Math.round((breakdown[key] / total) * 100);
    }

    return { breakdown, percentages };
  };

  const { percentages } = getReviewBreakdown();

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-zinc-900/60 backdrop-blur-md border-b border-zinc-850 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">StoreCenter</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-black text-zinc-400 border border-zinc-850 rounded-md">User</span>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-sm text-zinc-400 hidden lg:block">
                Welcome, <span className="font-semibold text-zinc-200">{user?.name}</span>
              </span>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-2.5 py-1.5 border border-zinc-700 text-xs font-semibold rounded-lg hover:border-zinc-500 hover:bg-zinc-850 transition-all flex items-center text-zinc-300"
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

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="mb-8 p-6 bg-gradient-to-r from-orange-950/20 via-zinc-900/60 to-amber-950/20 rounded-2xl border border-orange-950/30 shadow-xl">
          <h1 className="text-3xl font-extrabold text-white">Explore & Rate Stores</h1>
          <p className="mt-2 text-sm text-zinc-400 max-w-2xl">
            Browse through registered stores, view ratings, and provide your feedback. Every rating matters!
          </p>
        </div>

        {/* Toolbar (Search, Filter, Sort) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search stores by name or address..."
              className="w-full bg-black border border-zinc-850 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-zinc-400">Sort By:</span>
            <button
              onClick={() => handleSort('store_name')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center border ${
                sortBy === 'store_name' 
                  ? 'bg-orange-600 border-orange-500 text-white' 
                  : 'bg-black border-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Store Name
              {sortBy === 'store_name' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />)}
            </button>
            <button
              onClick={() => handleSort('avg_rating')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center border ${
                sortBy === 'avg_rating' 
                  ? 'bg-orange-600 border-orange-500 text-white' 
                  : 'bg-black border-zinc-850 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Average Rating
              {sortBy === 'avg_rating' && (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />)}
            </button>
          </div>
        </div>

        {/* Store Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center text-rose-400 text-sm animate-shake">
            <ShieldAlert className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : stores.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-2xl border border-dashed border-zinc-800">
            <p className="text-zinc-500 text-base">No stores matched your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedStores().map((store) => (
              <div 
                key={store.store_id} 
                className="bg-zinc-900/40 rounded-2xl border border-zinc-850 overflow-hidden hover:border-zinc-800 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-950/10 flex flex-col justify-between group cursor-pointer"
                onClick={() => openStoreDetails(store)}
              >
                <div className="p-6 space-y-4">
                  {/* Header info */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-orange-400 transition-colors truncate">{store.store_name}</h3>
                    {/* Overall Rating Display */}
                    <div className="flex items-center px-2 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold whitespace-nowrap">
                      <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400 animate-pulse" />
                      {store.avg_rating ? parseFloat(store.avg_rating).toFixed(1) : '0.0'}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="space-y-2 text-sm text-zinc-400">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{store.store_email}</span>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="w-4 h-4 mr-2 text-zinc-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-relaxed">{store.store_address}</span>
                    </div>
                  </div>
                </div>

                {/* Footer submit block */}
                <div className="px-6 pb-6 pt-3 border-t border-zinc-850 flex items-center justify-between bg-zinc-950/40">
                  <div className="text-xs">
                    <span className="text-zinc-500 block">Your Rating</span>
                    {store.user_rating ? (
                      <span className="text-orange-400 font-bold flex items-center text-sm mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-current text-orange-400 mr-1" />
                        {store.user_rating} / 5
                      </span>
                    ) : (
                      <span className="text-zinc-500 block italic mt-0.5">Not Rated</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Stop opening details just for clicking rate
                      openStoreDetails(store);
                    }}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center ${
                      store.user_rating 
                        ? 'border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:bg-zinc-850' 
                        : 'bg-orange-600 text-white hover:bg-orange-500 shadow-md shadow-orange-600/10'
                    }`}
                  >
                    {store.user_rating ? (
                      <>
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Modify
                      </>
                    ) : 'Rate Store'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Yelp-Style Store Details Modal */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-4xl w-full p-6 md:p-8 shadow-2xl relative space-y-6 my-8">
            <button 
              onClick={() => setSelectedStore(null)}
              className="absolute top-4 right-4 p-2 bg-black border border-zinc-850 text-zinc-400 hover:text-white rounded-xl transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header details */}
            <div className="border-b border-zinc-800 pb-6 space-y-3">
              <h2 className="text-2xl md:text-3xl font-black text-white">{selectedStore.store_name}</h2>
              <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center text-zinc-300 bg-black px-3 py-1.5 border border-zinc-855 rounded-xl font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1.5" />
                  {selectedStore.avg_rating ? parseFloat(selectedStore.avg_rating).toFixed(1) : '0.0'} Overall Rating
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1.5 text-zinc-500" />
                  {selectedStore.store_email}
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-zinc-500" />
                  {selectedStore.store_address}
                </div>
              </div>
            </div>

            {/* Main Modal Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Rating Submission & Score Breakdown */}
              <div className="space-y-6">
                {/* Score Breakdown Progress Bars */}
                <div className="bg-black/80 p-5 rounded-2xl border border-zinc-850 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Rating Breakdown</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center space-x-2 text-xs">
                        <span className="text-zinc-400 w-3 font-semibold">{star}</span>
                        <Star className="w-3.5 h-3.5 text-zinc-500 fill-current" />
                        <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-400 rounded-full transition-all duration-500" 
                            style={{ width: `${percentages[star] || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-zinc-500 w-8 text-right font-semibold">{percentages[star] || 0}%</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-650 block text-center mt-1">Based on {storeReviews.length} customer ratings</span>
                </div>

                {/* Rating Input Widget */}
                <div className="bg-gradient-to-br from-orange-950/15 to-black p-5 rounded-2xl border border-orange-950/20 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                    {selectedStore.user_rating_id ? <Edit className="w-4 h-4 text-orange-400 mr-1.5" /> : <Star className="w-4 h-4 text-orange-400 mr-1.5" />}
                    {selectedStore.user_rating_id ? 'Modify Your Rating' : 'Rate this Store'}
                  </h3>
                  
                  {/* Clickable Stars */}
                  <div className="flex justify-center space-x-1.5 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="transition-transform duration-100 hover:scale-125 focus:outline-none"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= ratingVal 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-zinc-700 hover:text-zinc-500'
                          }`} 
                        />
                      </button>
                    ))}
                  </div>

                  {ratingError && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 flex items-start">
                      <AlertCircle className="w-4 h-4 mr-1.5 text-rose-400 flex-shrink-0 mt-0.5" />
                      <span>{ratingError}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isSubmittingRating}
                    onClick={handleRatingSubmit}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold rounded-xl text-white shadow-lg shadow-orange-600/20 transition-all"
                  >
                    {isSubmittingRating ? 'Saving...' : selectedStore.user_rating_id ? 'Update Rating' : 'Submit Rating'}
                  </button>
                </div>
              </div>

              {/* Right Column: Scrollable List of Customer Reviews */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-zinc-500" />
                  Recent Customer Ratings ({storeReviews.length})
                </h3>

                <div className="max-h-[360px] overflow-y-auto pr-2 space-y-4 divide-y divide-zinc-850">
                  {loadingReviews ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="w-6 h-6 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
                    </div>
                  ) : storeReviews.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 italic text-sm">
                      No ratings details available for this store. Be the first to rate!
                    </div>
                  ) : (
                    storeReviews.map((review, idx) => (
                      <div key={review.rating_id} className={`pt-4 ${idx === 0 ? 'pt-0 border-none' : ''} space-y-2`}>
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-zinc-850 border border-zinc-750 text-zinc-300 flex items-center justify-center mr-2.5 text-xs font-bold uppercase">
                              {review.name?.charAt(0)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-zinc-200 block">{review.name}</span>
                              <span className="text-[10px] text-zinc-500 block">{review.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-[10px] font-bold">
                            <Star className="w-3 h-3 fill-current text-amber-400 mr-1" />
                            {review.rating_value}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1">
                          <span className="flex items-center">
                            <Calendar className="w-3.5 h-3.5 mr-1" />
                            {new Date(review.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400 animate-shake">
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

export default UserDashboard;
