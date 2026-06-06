import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, Shield, Store, Users, ArrowRight, MessageSquare, CheckCircle, Smartphone, Globe, ShieldCheck } from 'lucide-react';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    if (user.role === 'Admin') navigate('/admin');
    else if (user.role === 'Store Owner') navigate('/owner');
    else navigate('/user');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse duration-5000"></div>

      {/* Header */}
      <header className="bg-zinc-900/60 backdrop-blur-md border-b border-zinc-850 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">S</div>
              <span className="text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">StoreCenter</span>
            </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleDashboardRedirect}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-semibold rounded-xl transition-all flex items-center text-white shadow-lg shadow-orange-600/20"
                >
                  Go to Dashboard
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </button>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-xs font-semibold text-zinc-300 hover:text-white px-3 py-2 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-semibold rounded-xl transition-all text-white shadow-lg shadow-orange-600/20"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="space-y-6 max-w-3xl">
          <span className="inline-flex px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">
            ★ Unified Store Reviews Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Discover and Rate{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Premium Local Stores
            </span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            StoreCenter brings transparency to store management. Customers rate and review stores; owners track performance statistics; and administrators manage store profiles and access credentials.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            {isAuthenticated ? (
              <button
                onClick={handleDashboardRedirect}
                className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-sm font-semibold rounded-xl transition-all flex items-center justify-center text-white shadow-xl shadow-orange-600/25"
              >
                Access Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-sm font-semibold rounded-xl transition-all flex items-center justify-center text-white shadow-xl shadow-orange-600/25"
                >
                  Register as Customer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 text-sm font-semibold rounded-xl transition-all flex items-center justify-center text-zinc-300"
                >
                  Sign In to Portal
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Matrix Section */}
        <div className="mt-24 w-full">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">Role-Based Workflows</h2>
            <p className="text-zinc-400 text-sm mt-1">Different dashboards tailored for every stakeholder role.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Card 1: Normal User */}
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-850 hover:border-zinc-800 transition-all duration-300">
              <div className="h-10 w-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-4 border border-orange-500/20">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">For Customers</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Register a free account instantly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Browse and search registered stores</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Rate stores between 1 to 5 stars</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Modify your ratings any time</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Store Owner */}
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-850 hover:border-zinc-800 transition-all duration-300">
              <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 mb-4 border border-amber-500/20">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">For Store Owners</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Monitor overall store average score</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Audit detailed review histories</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track name/email of reviewers</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-amber-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Secure password updating module</span>
                </li>
              </ul>
            </div>

            {/* Card 3: Admin */}
            <div className="bg-zinc-900/40 p-6 rounded-2xl border border-zinc-855 hover:border-zinc-800 transition-all duration-300">
              <div className="h-10 w-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-400 mb-4 border border-yellow-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">For Administrators</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Create stores and assign store owners</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Manage Admin, Owner & Normal users</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track counts of stores, ratings & users</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Sort and filter directories dynamically</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mt-24 w-full border-t border-zinc-900 pt-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white tracking-tight">Loved by Customers & Owners</h2>
            <p className="text-zinc-400 text-sm mt-1">See how our platform enhances visibility and trusts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-850 relative">
              <MessageSquare className="w-8 h-8 text-zinc-800 absolute top-6 right-6" />
              <div className="flex items-center space-x-1 text-orange-400 mb-3">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed italic">
                "Finding great coffee shops in my neighborhood used to require multiple search tools. StoreCenter makes it super simple to filter by average score, read honest reviews, and rate stores instantly."
              </p>
              <div className="mt-4">
                <span className="text-xs font-bold text-zinc-200 block">Clarissa Henderson</span>
                <span className="text-[10px] text-zinc-500 block">Normal User / Customer</span>
              </div>
            </div>

            <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-850 relative">
              <MessageSquare className="w-8 h-8 text-zinc-800 absolute top-6 right-6" />
              <div className="flex items-center space-x-1 text-orange-400 mb-3">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed italic">
                "As a restaurant owner, keeping track of customer feedback is vital. The owner dashboard gives me the exact ratings list with reviewer details, letting me monitor our ratings changes directly."
              </p>
              <div className="mt-4">
                <span className="text-xs font-bold text-zinc-200 block">Marcus Sterling</span>
                <span className="text-[10px] text-zinc-500 block">Store Owner / 'Gourmet Foods'</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-900 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-7 w-7 bg-orange-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">S</div>
                <span className="text-md font-bold text-white">StoreCenter</span>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                A modern review aggregator connecting administrators, store owners, and customers.
              </p>
            </div>
            
            <div>
              <h4 className="text-xs font-bold text-zinc-350 uppercase tracking-wider mb-3">Products</h4>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><Link to="/login" className="hover:text-zinc-300 transition-colors">Store Audits</Link></li>
                <li><Link to="/login" className="hover:text-zinc-300 transition-colors">Reviews Portal</Link></li>
                <li><Link to="/login" className="hover:text-zinc-300 transition-colors">Owner Console</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-350 uppercase tracking-wider mb-3">System Trust</h4>
              <div className="space-y-2.5">
                <div className="flex items-center text-xs text-zinc-400">
                  <ShieldCheck className="w-4 h-4 text-orange-500 mr-2" />
                  <span>Secure AES Hashing</span>
                </div>
                <div className="flex items-center text-xs text-zinc-400">
                  <Smartphone className="w-4 h-4 text-orange-500 mr-2" />
                  <span>Mobile Adaptive UI</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-zinc-350 uppercase tracking-wider mb-3">Company</h4>
              <ul className="space-y-2 text-xs text-zinc-500">
                <li><a href="#" className="hover:text-zinc-300 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-zinc-300 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-900 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600 gap-4">
            <span>&copy; {new Date().getFullYear()} StoreCenter Inc. All rights reserved.</span>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-zinc-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-zinc-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
