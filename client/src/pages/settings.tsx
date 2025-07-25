import { ArrowLeft, User, Bell, Sun, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleGoBack = () => {
    setLocation('/');
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Personal Information",
          description: "Manage your personal information",
          onClick: () => {
            // Navigate to personal info page
          },
        },
        {
          icon: Bell,
          title: "Notifications",
          description: "Manage your notification preferences",
          onClick: () => {
            // Navigate to notifications page
          },
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: Sun,
          title: "Display",
          description: "Adjust your display preferences",
          onClick: () => {
            // Navigate to display settings page
          },
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          title: "Help & Support",
          description: "Get help and support",
          onClick: () => {
            // Navigate to help page
          },
        },
      ],
    },
  ];

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoBack} 
            className="p-2 mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900" data-testid="text-page-title">
            Settings
          </h1>
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        {/* User Info */}
        {isAuthenticated && user && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" data-testid="text-user-name">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </h3>
                  <p className="text-gray-600 text-sm" data-testid="text-user-email">
                    {user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4" data-testid={`text-section-${section.title.toLowerCase()}`}>
              {section.title}
            </h2>
            <div className="space-y-3">
              {section.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className="w-full h-auto p-4 justify-start"
                    onClick={item.onClick}
                    data-testid={`button-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Card className="w-full border-0 shadow-none">
                      <CardContent className="p-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-medium text-gray-900">{item.title}</h3>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </CardContent>
                    </Card>
                  </Button>
                );
              })}
            </div>
          </section>
        ))}

        {/* Logout Button */}
        {isAuthenticated && (
          <div className="pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Sign Out
            </Button>
          </div>
        )}
      </main>

      <BottomNavigation currentPage="settings" />
    </div>
  );
}
