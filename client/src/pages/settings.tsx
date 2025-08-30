import { ArrowLeft, User, Bell, Sun, HelpCircle, LogOut, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "" });

  // Get user ID from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('altmed_user_id') : null;

  // Fetch user profile data
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await apiRequest('GET', `/api/user/profile`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!userId && isAuthenticated,
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: { firstName: string; lastName: string }) => {
      if (!userId) throw new Error('No user ID');
      const response = await apiRequest('PUT', '/api/user/profile', updates);
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
      setIsEditingProfile(false);
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Initialize edit form when profile data loads
  useEffect(() => {
    if (userProfile) {
      setEditForm({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
      });
    }
  }, [userProfile]);

  const handleSaveProfile = () => {
    if (editForm.firstName.trim() && editForm.lastName.trim()) {
      updateProfileMutation.mutate(editForm);
    } else {
      toast({
        title: "Validation Error",
        description: "First name and last name are required.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (userProfile) {
      setEditForm({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
      });
    }
  };

  const handleGoBack = () => {
    setLocation('/');
  };

  const handleLogout = () => {
    // Clear localStorage items
    localStorage.removeItem('altmed_user_id');
    localStorage.removeItem('altmed_user_email');
    
    // Clear all React Query cache to remove any authenticated data
    queryClient.clear();
    
    // Redirect to server logout endpoint
    window.location.href = '/api/logout';
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          title: "Personal Information",
          description: userProfile 
            ? `${userProfile.firstName || 'No first name'} ${userProfile.lastName || 'No last name'}`
            : "Manage your personal information",
          onClick: () => {
            setIsEditingProfile(true);
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
        <div className="flex items-center justify-between">
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
          
          {/* User Name Display */}
          {isLoadingProfile ? (
            <div className="text-right">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-1 w-24"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
          ) : userProfile ? (
            <div className="text-right">
              <h2 className="text-lg font-semibold text-primary">
                {userProfile.firstName && userProfile.lastName 
                  ? `${userProfile.firstName} ${userProfile.lastName}`
                  : "User"
                }
              </h2>
              <p className="text-sm text-gray-600">
                {userProfile.email || "No email"}
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <main className="px-6 py-6 space-y-8">
        {/* User Info */}
        {isAuthenticated && isLoadingProfile && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isAuthenticated && userProfile && !isLoadingProfile && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {userProfile.profileImageUrl ? (
                    <img
                      src={userProfile.profileImageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900" data-testid="text-user-name">
                    {userProfile.firstName && userProfile.lastName 
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : userProfile.email || "User"
                    }
                  </h3>
                  <p className="text-gray-600 text-sm" data-testid="text-user-email">
                    {userProfile.email || "No email"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  className="p-2"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </Button>
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

      {/* Profile Editing Dialog */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Personal Information</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter last name"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="flex-1"
                  disabled={updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  className="flex-1"
                  disabled={updateProfileMutation.isPending || !editForm.firstName.trim() || !editForm.lastName.trim()}
                >
                  {updateProfileMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation currentPage="settings" />
    </div>
  );
}
