import { Home, Gamepad2, Trophy, Wallet, User as UserIcon } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';
import { User } from '@shared/schema';
import WalletModal from '@/components/wallet/wallet-modal';

interface MobileNavProps {
  user: User | null;
}

export default function MobileNav({ user }: MobileNavProps) {
  const [location] = useLocation();
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden z-40">
        <div className="flex justify-around">
          <Link href="/">
            <div className={`flex flex-col items-center px-3 py-1 ${location === '/' ? 'text-primary' : 'text-gray-500'}`}>
              <Home className="h-6 w-6" />
              <span className="text-xs">Home</span>
            </div>
          </Link>
          
          <Link href="/games">
            <div className={`flex flex-col items-center px-3 py-1 ${location === '/games' ? 'text-primary' : 'text-gray-500'}`}>
              <Gamepad2 className="h-6 w-6" />
              <span className="text-xs">Games</span>
            </div>
          </Link>
          
          <Link href="/leaderboard">
            <div className={`flex flex-col items-center px-3 py-1 ${location === '/leaderboard' ? 'text-primary' : 'text-gray-500'}`}>
              <Trophy className="h-6 w-6" />
              <span className="text-xs">Leaderboard</span>
            </div>
          </Link>
          
          <div 
            className="flex flex-col items-center px-3 py-1 text-gray-500 cursor-pointer"
            onClick={() => setShowWalletModal(true)}
          >
            <Wallet className="h-6 w-6" />
            <span className="text-xs">Wallet</span>
          </div>
          
          <Link href="/profile">
            <div className={`flex flex-col items-center px-3 py-1 ${location === '/profile' ? 'text-primary' : 'text-gray-500'}`}>
              <UserIcon className="h-6 w-6" />
              <span className="text-xs">Profile</span>
            </div>
          </Link>
        </div>
      </div>
      
      <WalletModal 
        showModal={showWalletModal} 
        setShowModal={setShowWalletModal} 
        user={user}
      />
    </>
  );
}
