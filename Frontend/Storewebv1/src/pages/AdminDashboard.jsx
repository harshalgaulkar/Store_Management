import React, { useEffect, useState } from 'react';
import API from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Store, Star, LogOut, ShieldAlert, Plus, Search, 
  Filter, UserPlus, Eye, LayoutDashboard, ChevronUp, ChevronDown, CheckCircle, ArrowUpDown
} from 'lucide-react';

const AdminDashboard = () => {
  const { logout, showToast } = useAuth();

  // Active View Tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'users', 'stores', 'add-user', 'add-store'

  // Summary counts
  const [counts, setCounts] = useState({ users: 0, stores: 0, ratings: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Users Directory state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState('All');
  const [usersSortBy, setUsersSortBy] = useState('name');
  const [usersSortOrder, setUsersSortOrder] = useState('asc');
  const [selectedUser, setSelectedUser] = useState(null); // Detail modal

  // Stores Directory state
  const [storesList, setStoresList] = useState([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [storesSearch, setStoresSearch] = useState('');
  const [storesSortBy, setStoresSortBy] = useState('store_name');
  const [storesSortOrder, setStoresSortOrder] = useState('asc');

  // Form states - Add User
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', address: '', phone: '', role: 'Normal' });
  const [userFormError, setUserFormError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Form states - Add Store
  const [storeForm, setStoreForm] = useState({ store_name: '', store_email: '', store_address: '', owner_id: '' });
  const [storeFormError, setStoreFormError] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // Fetch count stats
  const fetchCounts = async () => {
    try {
      setLoadingCounts(true);
      const userCountRes = await API.get('/admins/users/count');
      const storeCountRes = await API.get('/admins/stores/count');
      const ratingCountRes = await API.get('/admins/ratings/count');

      // The users count in the backend is for Normal users.
      // Let's display that as userCount.
      setCounts({
        users: userCountRes.data.data?.userCount || 0,
        stores: storeCountRes.data.data?.storeCount || 0,
        ratings: ratingCountRes.data.data?.ratingCount || 0
      });
    } catch (err) {
      console.error('Error fetching count stats:', err);
    } finally {
      setLoadingCounts(false);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await API.get('/admins/users/all');
      if (response.data.status === 'success') {
        setUsersList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch all stores
  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await API.get('/admins/stores/all');
      if (response.data.status === 'success') {
        setStoresList(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoadingStores(false);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchUsers();
    fetchStores();
  }, []);

  // Sorting handlers
  const handleUsersSort = (field) => {
    const isAsc = usersSortBy === field && usersSortOrder === 'asc';
    setUsersSortOrder(isAsc ? 'desc' : 'asc');
    setUsersSortBy(field);
  };

  const handleStoresSort = (field) => {
    const isAsc = storesSortBy === field && storesSortOrder === 'asc';
    setStoresSortOrder(isAsc ? 'desc' : 'asc');
    setStoresSortBy(field);
  };

  // Filtering & Sorting Lists
  const getFilteredUsers = () => {
    return usersList
      .filter(u => {
        // Search filter: Name, Email, Address
        const term = usersSearch.toLowerCase();
        const matchesSearch = 
          (u.name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term) ||
          (u.address || '').toLowerCase().includes(term);

        // Role filter
        const matchesRole = usersRoleFilter === 'All' || u.role === usersRoleFilter;

        return matchesSearch && matchesRole;
      })
      .sort((a, b) => {
        let valA = a[usersSortBy];
        let valB = b[usersSortBy];

        if (usersSortBy === 'avg_rating') {
          valA = parseFloat(valA || 0);
          valB = parseFloat(valB || 0);
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return usersSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return usersSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  };

  const getFilteredStores = () => {
    return storesList
      .filter(s => {
        const term = storesSearch.toLowerCase();
        return (
          (s.store_name || '').toLowerCase().includes(term) ||
          (s.store_address || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        let valA = a[storesSortBy];
        let valB = b[storesSortBy];

        if (storesSortBy === 'avg_rating') {
          valA = parseFloat(valA || 0);
          valB = parseFloat(valB || 0);
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return storesSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return storesSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  };

  // Create User Validator & Submitter
  const handleUserCreate = async (e) => {
    e.preventDefault();
    setUserFormError('');

    // Validations
    if (userForm.name.length < 20 || userForm.name.length > 60) {
      setUserFormError('Name must be between 20 and 60 characters.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.email)) {
      setUserFormError('Please enter a valid email address.');
      return;
    }
    if (userForm.address.length > 400 || userForm.address.length === 0) {
      setUserFormError('Address is required and must be under 400 characters.');
      return;
    }
    // Password verification: 8-16 chars, 1 uppercase, 1 special
    const hasUppercase = /[A-Z]/.test(userForm.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(userForm.password);
    const isLengthValid = userForm.password.length >= 8 && userForm.password.length <= 16;
    if (!hasUppercase || !hasSpecialChar || !isLengthValid) {
      setUserFormError('Password must be 8-16 characters, containing at least one uppercase letter and one special character.');
      return;
    }

    setIsCreatingUser(true);
    try {
      let path = '/users/register';
      if (userForm.role === 'Admin') path = '/admins/register';
      else if (userForm.role === 'Store Owner') path = '/store-owners/register';

      const response = await API.post(path, {
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        address: userForm.address,
        phone: userForm.phone || 'N/A',
        role: userForm.role
      });

      if (response.data.status === 'success' || response.data.success) {
        showToast(`Successfully registered new ${userForm.role}!`, 'success');
        setUserForm({ name: '', email: '', password: '', address: '', phone: '', role: 'Normal' });
        fetchCounts();
        fetchUsers();
      } else {
        const errVal = response.data.error;
        setUserFormError(typeof errVal === 'object' ? (errVal.code === 'ECONNREFUSED' ? 'Database connection refused. Please check server settings.' : JSON.stringify(errVal)) : (errVal || 'Failed to create user.'));
      }
    } catch (err) {
      console.error(err);
      setUserFormError('Server error creating user.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Create Store Submitter
  const handleStoreCreate = async (e) => {
    e.preventDefault();
    setStoreFormError('');

    if (!storeForm.owner_id) {
      setStoreFormError('Please select a Store Owner.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(storeForm.store_email)) {
      setStoreFormError('Please enter a valid email address.');
      return;
    }
    if (storeForm.store_address.length > 400 || storeForm.store_address.length === 0) {
      setStoreFormError('Address is required and must be under 400 characters.');
      return;
    }

    setIsCreatingStore(true);
    try {
      const response = await API.post('/stores/add', {
        owner_id: storeForm.owner_id,
        store_name: storeForm.store_name,
        store_email: storeForm.store_email,
        store_address: storeForm.store_address
      });

      if (response.data.status === 'success' || response.data.success) {
        showToast('Store registered successfully!', 'success');
        setStoreForm({ store_name: '', store_email: '', store_address: '', owner_id: '' });
        fetchCounts();
        fetchStores();
        fetchUsers(); // Refresh rating averages in users list
      } else {
        const errVal = response.data.error;
        setStoreFormError(typeof errVal === 'object' ? (errVal.code === 'ECONNREFUSED' ? 'Database connection refused. Please check server settings.' : JSON.stringify(errVal)) : (errVal || 'Failed to register store.'));
      }
    } catch (err) {
      console.error(err);
      setStoreFormError('Server error registering store.');
    } finally {
      setIsCreatingStore(false);
    }
  };

  // Helper sort icon renderers
  const renderSortIcon = (field, currentSortBy, sortOrder) => {
    if (currentSortBy !== field) return <ArrowUpDown className="w-3 h-3 ml-1 text-zinc-500" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3 h-3 ml-1 text-orange-400" />
      : <ChevronDown className="w-3 h-3 ml-1 text-orange-400" />;
  };

  // Get Store Owners list for store-creation dropdown
  const storeOwners = usersList.filter(u => u.role === 'Store Owner');

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <nav className="bg-zinc-900/60 backdrop-blur-md border-b border-zinc-850 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">StoreCenter</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-md">Admin</span>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-xs font-semibold px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full hidden sm:inline-block">
                System Administrator
              </span>
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

      <div className="flex-1 max-w-7xl w-full mx-auto py-10 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 mr-3" />
              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'users' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40'
              }`}
            >
              <Users className="w-4 h-4 mr-3" />
              Users Directory
            </button>
            <button
              onClick={() => setActiveTab('stores')}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'stores' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40'
              }`}
            >
              <Store className="w-4 h-4 mr-3" />
              Stores Directory
            </button>
            <div className="h-px bg-zinc-800 my-2"></div>
            <button
              onClick={() => setActiveTab('add-user')}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'add-user' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40'
              }`}
            >
              <UserPlus className="w-4 h-4 mr-3" />
              Add User
            </button>
            <button
              onClick={() => setActiveTab('add-store')}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                activeTab === 'add-store' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-950/40'
              }`}
            >
              <Plus className="w-4 h-4 mr-3" />
              Add Store
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 min-w-0">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="p-6 bg-gradient-to-r from-orange-950/20 via-zinc-900/60 to-amber-950/20 rounded-2xl border border-orange-950/30 shadow-xl">
                <h1 className="text-3xl font-extrabold text-white">System Admin Overview</h1>
                <p className="mt-2 text-sm text-zinc-400">
                  Comprehensive dashboard monitoring store registries, rating counts, and normal user registries.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Users Count Card */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-850 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-orange-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-black px-2.5 py-1 rounded-full">Normal Users</span>
                  </div>
                  {loadingCounts ? (
                    <div className="h-9 w-12 bg-zinc-800 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-4xl font-black text-white">{counts.users}</span>
                  )}
                  <p className="text-xs text-zinc-500 mt-2">Total registered normal users</p>
                </div>

                {/* Stores Count Card */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-850 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <Store className="w-8 h-8 text-amber-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-black px-2.5 py-1 rounded-full">Stores</span>
                  </div>
                  {loadingCounts ? (
                    <div className="h-9 w-12 bg-zinc-800 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-4xl font-black text-white">{counts.stores}</span>
                  )}
                  <p className="text-xs text-zinc-500 mt-2">Total registered stores on platform</p>
                </div>

                {/* Ratings Count Card */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-850 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl"></div>
                  <div className="flex items-center justify-between mb-4">
                    <Star className="w-8 h-8 text-orange-400" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-black px-2.5 py-1 rounded-full">Ratings</span>
                  </div>
                  {loadingCounts ? (
                    <div className="h-9 w-12 bg-zinc-800 rounded animate-pulse"></div>
                  ) : (
                    <span className="text-4xl font-black text-white">{counts.ratings}</span>
                  )}
                  <p className="text-xs text-zinc-500 mt-2">Total ratings values submitted</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USERS DIRECTORY */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Users Directory</h1>
                <p className="text-sm text-zinc-400 mt-1">Manage and audit system accounts across all user roles.</p>
              </div>

              {/* Filtering Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or address..."
                    className="w-full bg-black border border-zinc-850 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-200"
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <Filter className="w-4 h-4 text-zinc-500" />
                  <span className="text-zinc-400">Role Filter:</span>
                  <select
                    value={usersRoleFilter}
                    onChange={(e) => setUsersRoleFilter(e.target.value)}
                    className="bg-black border border-zinc-850 text-zinc-300 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="All">All Roles</option>
                    <option value="Normal">Normal User</option>
                    <option value="Store Owner">Store Owner</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl">
                {loadingUsers ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
                  </div>
                ) : getFilteredUsers().length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 text-sm">No users matched the criteria.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-850 bg-black/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          <th onClick={() => handleUsersSort('name')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center">
                              Name
                              {renderSortIcon('name', usersSortBy, usersSortOrder)}
                            </div>
                          </th>
                          <th onClick={() => handleUsersSort('email')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center">
                              Email
                              {renderSortIcon('email', usersSortBy, usersSortOrder)}
                            </div>
                          </th>
                          <th onClick={() => handleUsersSort('role')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center">
                              Role
                              {renderSortIcon('role', usersSortBy, usersSortOrder)}
                            </div>
                          </th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850 text-sm">
                        {getFilteredUsers().map((u) => (
                          <tr key={u.uid} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="px-6 py-4 text-zinc-200 font-semibold">{u.name}</td>
                            <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                u.role === 'Admin' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                                u.role === 'Store Owner' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-zinc-800 text-zinc-350 border border-zinc-700'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="inline-flex items-center px-3 py-1.5 bg-black border border-zinc-800 text-xs font-semibold rounded-lg hover:border-zinc-550 hover:bg-zinc-850 transition-all text-zinc-300"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STORES DIRECTORY */}
          {activeTab === 'stores' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-white">Stores Directory</h1>
                <p className="text-sm text-zinc-400 mt-1">Audit and overview registered stores and overall performance ratings.</p>
              </div>

              {/* Filtering Toolbar */}
              <div className="flex items-center justify-between bg-zinc-900/40 p-4 rounded-xl border border-zinc-850">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search stores by name or address..."
                    className="w-full bg-black border border-zinc-850 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-200"
                    value={storesSearch}
                    onChange={(e) => setStoresSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Stores Table */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-850 overflow-hidden shadow-xl">
                {loadingStores ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
                  </div>
                ) : getFilteredStores().length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 text-sm">No stores registered yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-850 bg-black/40 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                          <th onClick={() => handleStoresSort('store_name')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center">
                              Store Name
                              {renderSortIcon('store_name', storesSortBy, storesSortOrder)}
                            </div>
                          </th>
                          <th onClick={() => handleStoresSort('store_email')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center">
                              Email
                              {renderSortIcon('store_email', storesSortBy, storesSortOrder)}
                            </div>
                          </th>
                          <th onClick={() => handleStoresSort('store_address')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors">
                            <div className="flex items-center">
                              Address
                              {renderSortIcon('store_address', storesSortBy, storesSortOrder)}
                            </div>
                          </th>
                          <th onClick={() => handleStoresSort('avg_rating')} className="px-6 py-4 cursor-pointer hover:text-white transition-colors text-center">
                            <div className="flex items-center justify-center">
                              Overall Rating
                              {renderSortIcon('avg_rating', storesSortBy, storesSortOrder)}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-850 text-sm">
                        {getFilteredStores().map((s) => (
                          <tr key={s.store_id} className="hover:bg-zinc-900/20 transition-colors">
                            <td className="px-6 py-4 text-zinc-200 font-semibold">{s.store_name}</td>
                            <td className="px-6 py-4 text-zinc-400">{s.store_email}</td>
                            <td className="px-6 py-4 text-zinc-400 max-w-xs truncate">{s.store_address}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg font-bold text-xs">
                                <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
                                {s.avg_rating ? parseFloat(s.avg_rating).toFixed(1) : 'Unrated'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ADD USER */}
          {activeTab === 'add-user' && (
            <div className="max-w-xl bg-zinc-900 border border-zinc-850 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add New User</h2>
                <p className="text-xs text-zinc-400 mt-1">Create a new Admin, Store Owner, or Normal user.</p>
              </div>

              <form onSubmit={handleUserCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Full Name (20-60 chars)</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205"
                      placeholder="Jonathan Doe Henderson Jr."
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205"
                      placeholder="jon.doe@example.com"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Password (8-16 chars)</label>
                    <input
                      type="password"
                      required
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205"
                      placeholder="••••••••"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Phone Number (Optional)</label>
                    <input
                      type="text"
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205"
                      placeholder="1234567890"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">User Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                      className="w-full bg-black border border-zinc-850 text-zinc-300 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none"
                    >
                      <option value="Normal">Normal User</option>
                      <option value="Store Owner">Store Owner</option>
                      <option value="Admin">Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Address (max 400 chars)</label>
                    <textarea
                      required
                      rows="2"
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205 resize-none"
                      placeholder="Address location..."
                      value={userForm.address}
                      onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                    />
                  </div>
                </div>

                {userFormError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
                    {userFormError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold rounded-xl text-white shadow-lg shadow-orange-600/20 transition-all"
                >
                  {isCreatingUser ? 'Registering User...' : 'Add User Account'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ADD STORE */}
          {activeTab === 'add-store' && (
            <div className="max-w-xl bg-zinc-900 border border-zinc-850 rounded-2xl p-6 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Add New Store</h2>
                <p className="text-xs text-zinc-400 mt-1">Create a new store profile and map it to a Store Owner.</p>
              </div>

              <form onSubmit={handleStoreCreate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Store Owner</label>
                  {storeOwners.length === 0 ? (
                    <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                      No Store Owner accounts found! Please register a user with role 'Store Owner' first.
                    </div>
                  ) : (
                    <select
                      value={storeForm.owner_id}
                      required
                      onChange={(e) => setStoreForm({ ...storeForm, owner_id: e.target.value })}
                      className="w-full bg-black border border-zinc-855 text-zinc-350 text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none"
                    >
                      <option value="">-- Select Owner --</option>
                      {storeOwners.map((owner) => (
                        <option key={owner.uid} value={owner.uid}>
                          {owner.name} ({owner.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Store Name</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205"
                      placeholder="Super Market Premium A"
                      value={storeForm.store_name}
                      onChange={(e) => setStoreForm({ ...storeForm, store_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Store Email</label>
                    <input
                      type="email"
                      required
                      className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205"
                      placeholder="contact@store-a.com"
                      value={storeForm.store_email}
                      onChange={(e) => setStoreForm({ ...storeForm, store_email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Store Address (max 400 chars)</label>
                  <textarea
                    required
                    rows="3"
                    className="w-full bg-black border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-all duration-205 resize-none"
                    placeholder="200 Commerce Blvd, Suite A..."
                    value={storeForm.store_address}
                    onChange={(e) => setStoreForm({ ...storeForm, store_address: e.target.value })}
                  />
                </div>

                {storeFormError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-400">
                    {storeFormError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingStore || storeOwners.length === 0}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-xs font-semibold rounded-xl text-white shadow-lg shadow-orange-600/20 transition-all"
                >
                  {isCreatingStore ? 'Registering Store...' : 'Register Store Profile'}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="text-center border-b border-zinc-850 pb-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-lg font-bold uppercase mb-2">
                {selectedUser.name?.charAt(0)}
              </div>
              <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 ${
                selectedUser.role === 'Admin' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                selectedUser.role === 'Store Owner' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-zinc-800 text-zinc-350 border border-zinc-700'
              }`}>
                {selectedUser.role}
              </span>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-medium">Email:</span>
                <span className="col-span-2 text-zinc-200 font-semibold break-all">{selectedUser.email}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-medium">Phone:</span>
                <span className="col-span-2 text-zinc-200 font-semibold">{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-zinc-500 font-medium">Address:</span>
                <span className="col-span-2 text-zinc-300 leading-relaxed">{selectedUser.address || 'N/A'}</span>
              </div>
              {selectedUser.role === 'Store Owner' && (
                <div className="grid grid-cols-3 items-center">
                  <span className="text-zinc-500 font-medium">Store Rating:</span>
                  <span className="col-span-2">
                    <span className="inline-flex items-center px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold">
                      <Star className="w-3 h-3 fill-current mr-1 text-amber-400" />
                      {selectedUser.avg_rating ? parseFloat(selectedUser.avg_rating).toFixed(1) : 'Unrated'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="w-full py-2.5 bg-black border border-zinc-800 text-xs font-semibold rounded-xl text-zinc-300 hover:border-zinc-500 hover:bg-zinc-850 transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
