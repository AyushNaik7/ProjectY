/**
 * Test the authentication fix for marketplace API
 * Run this in browser console after logging in as a creator
 */

async function testAuthFix() {
  console.log('🔐 Testing Authentication Fix...');
  
  // Get current user info from the page context
  const userInfo = window.__NEXT_DATA__?.props?.pageProps?.user || 
                   window.localStorage.getItem('user') ||
                   'test-user-id'; // fallback for testing
  
  console.log('👤 User info:', userInfo);
  
  // Test the marketplace API with user ID in body
  try {
    const response = await fetch('/api/marketplace-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: typeof userInfo === 'string' ? userInfo : userInfo?.id || 'user_3BrQdL26hXZgoaHhWNsLkx1upxz'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Authentication fixed! API working');
      console.log(`📊 Found ${data.campaigns?.length || 0} campaigns`);
      
      if (data.campaigns?.length > 0) {
        console.log('🎯 Sample campaign:', {
          title: data.campaigns[0].title,
          match_score: data.campaigns[0].match_score || 'N/A',
          brand: data.campaigns[0].brands?.name || 'Unknown'
        });
      }
      
      return { success: true, campaigns: data.campaigns?.length || 0 };
    } else {
      console.error('❌ Still failing:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run
if (typeof window !== 'undefined') {
  testAuthFix().then(result => {
    console.log('\n🎯 Auth Fix Result:', result);
    
    if (result.success) {
      console.log('🎉 The campaigns page should now work with AI functionality!');
      console.log('💡 Refresh the page to see the changes');
    } else {
      console.log('⚠️ Still having issues. The fallback should still work though.');
    }
  });
}