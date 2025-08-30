import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">AltMed</CardTitle>
            <CardDescription className="text-gray-600">
              Find alternative medications for your symptoms with AI-powered recommendations
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-gray-700">AI-powered medication recommendations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-gray-700">Find nearby pharmacies with stock info</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-gray-700">Compare medications side-by-side</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-gray-700">Save favorites and track history</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white py-3"
              onClick={() => {
                // In development, directly navigate to the home page
                // Check for development environment (Vite sets DEV to true in development)
                
                //   window.location.reload();
                //   setTimeout(() => {
                //     window.location.href = '/';
                //   }, 100);
                // } else {
                  window.location.href = '/api/login';
                // }
              }}
              data-testid="button-login"
            >
              Get Started
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy Policy.
              This app provides general information only and is not a substitute for professional medical advice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
