import { Search, Scale, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface BottomNavigationProps {
  currentPage: "search" | "compare" | "favorites" | "settings";
}

export default function BottomNavigation({ currentPage }: BottomNavigationProps) {
  const [, setLocation] = useLocation();

  const tabs = [
    {
      id: "search" as const,
      label: "Search",
      icon: Search,
      path: "/",
    },
    {
      id: "compare" as const,
      label: "Compare", 
      icon: Scale,
      path: "/compare",
    },
    {
      id: "favorites" as const,
      label: "Favorites",
      icon: Heart,
      path: "/favorites",
    },
    {
      id: "settings" as const,
      label: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 max-w-md w-full bg-white border-t border-gray-200">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentPage === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              className={`flex flex-col items-center py-2 px-4 ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
              onClick={() => setLocation(tab.path)}
              data-testid={`nav-tab-${tab.id}`}
            >
              <IconComponent className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
