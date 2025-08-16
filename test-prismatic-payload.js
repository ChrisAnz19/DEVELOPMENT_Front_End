/**
 * Test script to show the exact payload sent to Prismatic webhook
 * This matches the payload structure from your frontend
 */

const WEBHOOK_URL = 'https://hooks.prismatic.io/trigger/SW5zdGFuY2VGbG93Q29uZmlnOjFhYWEyYWJkLWFkNTktNDI3Yi05MjM3LWQzMDE2MGVjMzUzNA==';

// This is the exact payload your frontend will send
const payload = {
  candidates: [
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
  ]
};

console.log('🎯 EXACT PAYLOAD STRUCTURE:');
console.log('==========================');
console.log(JSON.stringify(payload, null, 2));

console.log('\n📡 WEBHOOK DETAILS:');
console.log('===================');
console.log('URL:', WEBHOOK_URL);
console.log('Method: POST');
console.log('Content-Type: application/json');

console.log('\n🧪 TEST THE WEBHOOK:');
console.log('====================');

async function testWebhook() {
  try {
    console.log('Sending payload to Prismatic webhook...');
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Response Body:', responseText);

    if (response.ok) {
      console.log('✅ SUCCESS: Webhook executed successfully!');
      console.log('🔍 Check your HubSpot for new contacts with behavioral analytics');
    } else {
      console.log('❌ ERROR: Webhook failed');
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

// Uncomment the line below to actually test the webhook
testWebhook();
