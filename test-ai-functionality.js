/**
 * Complete AI Functionality Test Script
 * Run this in browser console after logging in as a creator
 */

async function testAIFunctionality() {
  console.log('🚀 Testing AI Functionality...\n');
  
  // Test 1: Check embedding status
  console.log('📊 Checking embedding status...');
  try {
    const embeddingResponse = await fetch('/api/generate-embeddings', {
      method: 'GET',
      credentials: 'include'
    });
    
    if (embeddingResponse.ok) {
      const embeddingData = await embeddingResponse.json();
      console.log('✅ Embedding Status:', embeddingData);
      
      if (!embeddingData.ready) {
        console.log('⚠️ Embeddings not ready. Generating...');
        
        // Generate embeddings
        const generateResponse = await fetch('/api/generate-embeddings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: 'both' })
        });
        
        if (generateResponse.ok) {
          const generateData = await generateResponse.json();
          console.log('✅ Embeddings generated:', generateData);
        } else {
          console.log('❌ Failed to generate embeddings');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Embedding API not available, continuing with test...');
  }
  
  // Test 2: Test marketplace API
  console.log('\n🧪 Testing Marketplace API...');
  try {
    const marketplaceResponse = await fetch('/api/marketplace-campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({})
    });
    
    const marketplaceData = await marketplaceResponse.json();
    
    if (marketplaceResponse.ok) {
      console.log('✅ Marketplace API working!');
      console.log(`📊 Found ${marketplaceData.campaigns?.length || 0} campaigns`);
      
      if (marketplaceData.campaigns?.length > 0) {
        const sample = marketplaceData.campaigns[0];
        console.log('📋 Sample campaign:', {
          title: sample.title,
          match_score: sample.match_score,
          match_reasons: sample.match_reasons
        });
      }
      
      return { success: true, campaigns: marketplaceData.campaigns?.length || 0 };
    } else {
      console.error('❌ Marketplace API failed:', marketplaceData.error);
      return { success: false, error: marketplaceData.error };
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...');
  
  // This would need to be run in your database
  console.log(`
Run this in your database to check status:

SELECT 
  (SELECT COUNT(*) FROM creators) as total_creators,
  (SELECT COUNT(*) FROM creators WHERE embedding IS NOT NULL) as creators_with_embeddings,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active') as active_campaigns,
  (SELECT COUNT(*) FROM campaigns WHERE status = 'active' AND embedding IS NOT NULL) as campaigns_with_embeddings,
  (SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector')) as vector_installed;
  `);
}

// Auto-run tests
if (typeof window !== 'undefined') {
  testAIFunctionality().then(result => {
    console.log('\n🎯 Final Result:', result);
    
    if (result.success) {
      console.log('🎉 AI functionality is working! The campaigns page should now show matched campaigns.');
    } else {
      console.log('⚠️ AI functionality needs fixing. Check the steps below:');
      console.log('1. Run FIX_AI_CAMPAIGNS.sql in your database');
      console.log('2. Restart your Next.js server');
      console.log('3. Make sure you\'re logged in as a creator');
      console.log('4. Try again');
    }
    
    checkDatabaseStatus();
  });
}