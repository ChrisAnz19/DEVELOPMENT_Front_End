/**
 * Test script to verify the Prismatic HubSpot integration webhook
 * Replace WEBHOOK_URL with your actual Prismatic webhook URL after deployment
 */

const WEBHOOK_URL = 'YOUR_PRISMATIC_WEBHOOK_URL_HERE';

const sampleCandidates = [
  {
    name: "John Smith",
    title: "Chief Technology Officer",
    company: "TechFlow Solutions",
    email: "john.smith@techflow.com",
    accuracy: 94,
    reasons: [
      "Currently CTO at a fast-growing SaaS company with 500+ employees",
      "Recently posted about cybersecurity challenges on LinkedIn",
      "Company experienced a security incident 6 months ago according to news reports",
      "Has budget authority for technology infrastructure decisions",
      "Previously implemented security solutions at two other companies"
    ],
    linkedin_url: "https://linkedin.com/in/johnsmith-cto",
    profile_photo_url: "https://media.licdn.com/profile/john-smith.jpg",
    location: "San Francisco, CA",
    behavioral_data: {
      behavioral_insight: "High-intent buyer actively researching solutions with decision-making authority",
      scores: {
        cmi: {
          score: 87,
          explanation: "Strong forward momentum - actively engaging with security vendors and has allocated Q2 budget for cybersecurity improvements"
        },
        rbfs: {
          score: 72,
          explanation: "Moderately risk-aware - balances security needs with operational efficiency, prefers proven solutions over cutting-edge"
        },
        ias: {
          score: 91,
          explanation: "High identity alignment - sees cybersecurity as core to his role as technology leader and company protector"
        }
      }
    }
  },
  {
    name: "Sarah Johnson",
    title: "VP of Engineering",
    company: "CloudScale Inc",
    email: "sarah.johnson@cloudscale.com",
    accuracy: 89,
    reasons: [
      "VP Engineering at 200-person SaaS startup in high-growth phase",
      "Actively researching zero-trust security architectures based on recent blog posts",
      "Company just raised Series B funding with security compliance requirements",
      "Has technical decision-making authority for infrastructure choices",
      "Frequently speaks at conferences about secure development practices"
    ],
    linkedin_url: "https://linkedin.com/in/sarah-johnson-engineering",
    profile_photo_url: "https://media.licdn.com/profile/sarah-johnson.jpg",
    location: "Austin, TX",
    behavioral_data: {
      behavioral_insight: "Technical decision-maker with strong influence on security architecture choices",
      scores: {
        cmi: {
          score: 82,
          explanation: "Good momentum - has been researching solutions for 3 months and company has budget allocated for security initiatives"
        },
        rbfs: {
          score: 65,
          explanation: "Moderate risk sensitivity - focused on technical implementation challenges rather than business risks"
        },
        ias: {
          score: 88,
          explanation: "Strong alignment - views security as fundamental to engineering excellence and personal technical reputation"
        }
      }
    }
  }
];

async function testWebhook() {
  console.log('🧪 Testing Prismatic HubSpot Integration Webhook...');
  
  if (WEBHOOK_URL === 'YOUR_PRISMATIC_WEBHOOK_URL_HERE') {
    console.error('❌ Please update WEBHOOK_URL with your actual Prismatic webhook URL');
    console.log('📋 Steps to get webhook URL:');
    console.log('   1. Deploy the integration in Prismatic');
    console.log('   2. Go to the "Create HubSpot Contacts" flow');
    console.log('   3. Copy the webhook URL');
    console.log('   4. Update WEBHOOK_URL in this file');
    return;
  }

  try {
    console.log(`📡 Sending ${sampleCandidates.length} candidates to: ${WEBHOOK_URL}`);
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ candidates: sampleCandidates }),
    });

    console.log(`📊 Response Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Webhook failed:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Webhook Success!');
    console.log('📄 Response:', JSON.stringify(result, null, 2));
    
    console.log('\n🎯 Next Steps:');
    console.log('   1. Check your HubSpot contacts for the new entries');
    console.log('   2. Verify behavioral analytics data is populated');
    console.log('   3. Check Prismatic execution logs for detailed info');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testWebhook();
