import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Wallet, User as UserIcon, Menu } from 'lucide-react';
import { User } from '@shared/schema';
import AuthModal from '@/components/auth/auth-modal';
import WalletModal from '@/components/wallet/wallet-modal';

interface HeaderProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

export default function Header({ user, setUser }: HeaderProps) {
  const [location] = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <Link href="/">
              <h1 className="text-xl font-bold font-poppins text-primary cursor-pointer">GalaxyGames</h1>
            </Link>
          </div>
          
          {/* User Section (desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/games">
              <Button variant="secondary" className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Play Now
              </Button>
            </Link>
            
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  className="bg-gray-100 hover:bg-gray-200 py-2 px-4"
                  onClick={() => setShowWalletModal(true)}
                >
                  <Wallet className="h-5 w-5 mr-1 text-gray-600" />
                  ₹{user.walletBalance}
                </Button>
                
                <div className="relative">
                  <Button 
                    variant="ghost"
                    className="flex items-center hover:text-primary transition-colors duration-200"
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <UserIcon className="h-6 w-6 mr-1" />
                    {user.username}
                  </Button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-20">
                      <Link href="/profile">
                        <div className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                          Profile
                        </div>
                      </Link>
                      {user.isAdmin && (
                        <Link href="/admin">
                          <div className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer">
                            Admin Dashboard
                          </div>
                        </Link>
                      )}
                      <div 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer"
                        onClick={handleLogout}
                      >
                        Logout
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button 
                variant="ghost" 
                className="flex items-center hover:text-primary transition-colors duration-200"
                onClick={() => setShowAuthModal(true)}
              >
                <UserIcon className="h-6 w-6 mr-1" />
                Login
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {showMenu && (
        <div className="md:hidden bg-white pb-3 border-t border-gray-200">
          <div className="container mx-auto px-4 space-y-3">
            <Link href="/">
              <div 
                className={`block py-2 hover:text-primary-500 ${location === '/' ? 'text-primary-500' : 'text-gray-700'}`}
                onClick={() => setShowMenu(false)}
              >
                Home
              </div>
            </Link>
            <Link href="/games">
              <div 
                className={`block py-2 hover:text-primary-500 ${location === '/games' ? 'text-primary-500' : 'text-gray-700'}`}
                onClick={() => setShowMenu(false)}
              >
                Games
              </div>
            </Link>
            <Link href="/leaderboard">
              <div 
                className={`block py-2 hover:text-primary-500 ${location === '/leaderboard' ? 'text-primary-500' : 'text-gray-700'}`}
                onClick={() => setShowMenu(false)}
              >
                Leaderboard
              </div>
            </Link>
            
            {user ? (
              <>
                <div 
                  className="block py-2 text-gray-700 hover:text-primary-500"
                  onClick={() => {
                    setShowMenu(false);
                    setShowWalletModal(true);
                  }}
                >
                  Wallet: ₹{user.walletBalance}
                </div>
                <Link href="/profile">
                  <div 
                    className={`block py-2 hover:text-primary-500 ${location === '/profile' ? 'text-primary-500' : 'text-gray-700'}`}
                    onClick={() => setShowMenu(false)}
                  >
                    Profile
                  </div>
                </Link>
                {user.isAdmin && (
                  <Link href="/admin">
                    <div 
                      className={`block py-2 hover:text-primary-500 ${location.startsWith('/admin') ? 'text-primary-500' : 'text-gray-700'}`}
                      onClick={() => setShowMenu(false)}
                    >
                      Admin Dashboard
                    </div>
                  </Link>
                )}
                <div
                  className="block py-2 text-gray-700 hover:text-primary-500 cursor-pointer"
                  onClick={() => {
                    handleLogout();
                    setShowMenu(false);
                  }}
                >
                  Logout
                </div>
              </>
            ) : (
              <Button 
                className="w-full"
                onClick={() => {
                  setShowAuthModal(true);
                  setShowMenu(false);
                }}
              >
                Login / Register
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Modals */}
      <AuthModal 
        showModal={showAuthModal} 
        setShowModal={setShowAuthModal} 
        setUser={setUser} 
      />
      
      <WalletModal 
        showModal={showWalletModal} 
        setShowModal={setShowWalletModal} 
        user={user}
      />
    </header>
  );
}
