'use client';

import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function TestOAuthPage() {
  const handleTest = async () => {
    console.log("=== TEST OAUTH ===");
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("Window origin:", window.location.origin);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      console.log("OAuth Data:", data);
      console.log("OAuth Error:", error);
      
      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        console.log("OAuth URL:", data.url);
        alert(`OAuth initiated! URL: ${data.url}`);
      }
    } catch (err) {
      console.error("Caught error:", err);
      alert(`Caught error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">OAuth Test Page</h1>
        <p className="text-gray-600">Click the button to test Google OAuth</p>
        <Button onClick={handleTest} size="lg">
          Test Google OAuth
        </Button>
        <p className="text-sm text-gray-500">Check browser console for logs</p>
      </div>
    </div>
  );
}
