/**
 * Test script to verify API functionality
 * Run this in the browser console on localhost:3000 after logging in as a creator
 */

async function testMarketplaceAPI() {
  console.log('🧪 Testing Marketplace API...');
  
  try {
    const response = await fetch('/api/marketplace-campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Marketplace API working!');
      console.log(`📊 Found ${data.campaigns?.length || 0} campaigns`);
      if (data.campaigns?.length > 0) {
        console.log('📋 Sample campaign:', data.campaigns[0]);
      }
      return true;
    } else {
      console.error('❌ Marketplace API failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

async function testCollaborationRequest() {
  console.log('🧪 Testing Collaboration Request API...');
  
  // First, get a creator ID (you'll need to replace this with an actual creator ID)
  const testCreatorId = 'test-creator-id'; // Replace with real creator ID
  
  try {
    const response = await fetch('/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        creatorId: testCreatorId,
        message: 'Test collaboration request'
        // Note: no campaignId - testing general request
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Collaboration Request API working!');
      console.log('📝 Request created:', data);
      return true;
    } else {
      console.log('ℹ️ Collaboration Request API response:', data.error);
      // This might fail due to auth/role restrictions, which is expected
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Run the tests
async function runAllTests() {
  console.log('🚀 Starting API functionality tests...\n');
  
  const marketplaceResult = await testMarketplaceAPI();
  console.log('');
  
  const requestResult = await testCollaborationRequest();
  console.log('');
  
  if (marketplaceResult) {
    console.log('🎉 AI functionality should now work on /campaigns page!');
  } else {
    console.log('⚠️ AI functionality may still have issues. Check the database fixes.');
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  runAllTests();
}