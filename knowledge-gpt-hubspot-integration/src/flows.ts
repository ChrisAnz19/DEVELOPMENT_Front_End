/**
 * HubSpot integration flows for creating contacts with behavioral analytics data.
 * This flow receives candidate data via webhook and creates corresponding HubSpot contacts.
 */

import { flow, HttpResponse } from "@prismatic-io/spectral";
import { createHubSpotClient, transformCandidateToHubSpotContact, type CandidateData } from "./client";

interface WebhookPayload {
  candidates: CandidateData[];
}

interface HubSpotContactResponse {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export const createHubSpotContacts = flow({
  name: "Create HubSpot Contacts",
  stableKey: "create-hubspot-contacts-with-behavioral-data",
  description: "Receive candidate data and create corresponding HubSpot contacts with behavioral analytics",
  
  onTrigger: async (context, payload) => {
    const { logger } = context;

    if (context.debug.enabled) {
      logger.debug(`Received webhook payload: ${JSON.stringify(payload, null, 2)}`);
    }

    // Validate that we have candidates data
    const body = payload.body?.data as any;
    let candidates: CandidateData[] = [];
    
    if (body && Array.isArray(body.candidates)) {
      candidates = body.candidates;
    } else if (body && Array.isArray(body)) {
      // Handle case where candidates array is sent directly
      candidates = body;
    } else {
      logger.error("Invalid payload: Expected 'candidates' array in request body");
      
      const errorResponse: HttpResponse = {
        statusCode: 400,
        contentType: "application/json",
        body: JSON.stringify({ 
          error: "Invalid payload", 
          message: "Expected 'candidates' array in request body" 
        }),
      };

      return Promise.resolve({ 
        payload: { ...payload, candidates: [] },
        response: errorResponse 
      });
    }

    logger.info(`Processing ${candidates.length} candidates for HubSpot creation`);

    // Return success response immediately (async processing)
    const successResponse: HttpResponse = {
      statusCode: 200,
      contentType: "application/json",
      body: JSON.stringify({ 
        message: "Candidates received and being processed",
        count: candidates.length 
      }),
    };

    return Promise.resolve({
      payload: { ...payload, candidates },
      response: successResponse,
    });
  },

  onExecution: async (context, params) => {
    const { logger, configVars } = context;
    const candidates = (params.onTrigger.results as any).candidates as CandidateData[];

    if (!candidates || candidates.length === 0) {
      logger.info("No candidates to process");
      return { data: { created: 0, errors: [] } };
    }

    // Create HubSpot client using OAuth connection
    const hubspotClient = createHubSpotClient(configVars["HubSpot OAuth Connection"]);
    
    const results = [];
    const errors = [];

    for (const candidate of candidates) {
      try {
        logger.info(`Processing candidate: ${candidate.name} (${candidate.email})`);

        // Transform candidate data to HubSpot contact format
        const contactData = transformCandidateToHubSpotContact(candidate);
        
        // Create HubSpot contact properties object
        const properties: Record<string, string> = {};
        Object.entries(contactData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            properties[key] = String(value);
          }
        });

        logger.debug(`HubSpot contact properties: ${JSON.stringify(properties, null, 2)}`);

        // Create contact in HubSpot
        const response = await hubspotClient.post<HubSpotContactResponse>("/crm/v3/objects/contacts", {
          properties,
        });

        logger.info(`Successfully created HubSpot contact: ${response.data.id} for ${candidate.name}`);
        
        results.push({
          candidate: candidate.name,
          email: candidate.email,
          hubspotId: response.data.id,
          success: true,
        });

      } catch (error: any) {
        logger.error(`Failed to create HubSpot contact for ${candidate.name}: ${error.message}`);
        
        // Check if it's a duplicate email error
        if (error.response?.status === 409 || error.message?.includes('CONTACT_EXISTS')) {
          logger.info(`Contact with email ${candidate.email} already exists in HubSpot`);
          
          results.push({
            candidate: candidate.name,
            email: candidate.email,
            hubspotId: null,
            success: true,
            note: 'Contact already exists',
          });
        } else {
          errors.push({
            candidate: candidate.name,
            email: candidate.email,
            error: error.message,
            success: false,
          });
        }
      }
    }

    logger.info(`HubSpot contact creation completed: ${results.length} successful, ${errors.length} errors`);

    return { 
      data: { 
        created: results.length,
        results,
        errors,
        total: candidates.length,
      } 
    };
  },
});

export const testHubSpotIntegration = flow({
  name: "Test HubSpot Integration",
  stableKey: "test-hubspot-integration-sample-data",
  description: "Test the HubSpot integration with sample candidate data",
  
  onExecution: async (context) => {
    const { logger } = context;
    
    // Sample test data matching your provided structure
    const sampleCandidates: CandidateData[] = [
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

    logger.info("Starting HubSpot integration test with sample data");

    // Simulate the same execution as the main flow
    const mockParams = {
      onTrigger: {
        results: {
          candidates: sampleCandidates
        }
      }
    };

    // Call the main flow's execution logic
    const result = await createHubSpotContacts.onExecution!(context, mockParams as any);
    
    logger.info(`Test completed: ${JSON.stringify(result, null, 2)}`);
    
    return result;
  },
});

export default [createHubSpotContacts, testHubSpotIntegration];
