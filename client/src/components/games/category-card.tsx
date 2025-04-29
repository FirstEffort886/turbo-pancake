import { Card, CardContent } from '@/components/ui/card';
import { 
  Puzzle, 
  BookOpen, 
  LayoutGrid, 
  Gamepad2, 
  Users 
} from 'lucide-react';
import { GameCategory } from '@shared/schema';

interface CategoryCardProps {
  category: GameCategory;
  onClick?: (category: GameCategory) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  // Get the appropriate icon based on the icon property
  const renderIcon = () => {
    const iconClasses = `h-6 w-6 text-${category.colorClass}-500`;
    
    switch (category.icon) {
      case 'puzzle':
        return <Puzzle className={iconClasses} />;
      case 'book-open':
        return <BookOpen className={iconClasses} />;
      case 'layout-grid':
        return <LayoutGrid className={iconClasses} />;
      case 'gamepad-2':
        return <Gamepad2 className={iconClasses} />;
      case 'users':
        return <Users className={iconClasses} />;
      default:
        return <Puzzle className={iconClasses} />;
    }
  };

  // Get the background color class based on the colorClass property
  const getBgColorClass = () => {
    return `bg-${category.colorClass}-100`;
  };

  return (
    <Card 
      className="shadow-sm hover:shadow-md transition overflow-hidden text-center p-4 cursor-pointer"
      onClick={() => onClick && onClick(category)}
    >
      <CardContent className="p-0">
        <div className={`h-14 w-14 ${getBgColorClass()} rounded-full flex items-center justify-center mx-auto mb-3`}>
          {renderIcon()}
        </div>
        <h3 className="font-medium font-poppins">{category.name}</h3>
      </CardContent>
    </Card>
  );
}
