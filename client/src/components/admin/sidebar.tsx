import { Link } from 'wouter';
import { 
  Users, 
  CreditCard,
  LayoutDashboard
} from 'lucide-react';

interface AdminSidebarProps {
  activeItem: string;
}

export default function AdminSidebar({ activeItem }: AdminSidebarProps) {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, path: '/admin' },
    { name: 'Users', icon: <Users className="h-5 w-5" />, path: '/admin/users' },
    { name: 'Transactions', icon: <CreditCard className="h-5 w-5" />, path: '/admin/transactions' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-6">
        <h3 className="font-semibold text-gray-500 uppercase text-xs tracking-wider mb-4">Admin Panel</h3>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link href={item.path}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                  activeItem === item.name.toLowerCase() ? 
                  'bg-primary/10 text-primary font-medium' : 
                  'text-gray-700 hover:bg-gray-100'
                } cursor-pointer transition-colors duration-150`}>
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}