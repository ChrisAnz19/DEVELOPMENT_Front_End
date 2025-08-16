/**
 * Unit tests for the Knowledge GPT HubSpot Integration flows.
 * These tests verify that the HubSpot contact creation flow works as expected.
 */

import { invokeFlow } from "@prismatic-io/spectral/dist/testing";
import { testHubSpotIntegration } from "./flows";

const hubspotConnection = {
  key: "hubspot-test-connection",
  fields: {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    hubId: "12345",
  },
};

describe("HubSpot Integration Flow Tests", () => {
  test("Test HubSpot integration with sample data", async () => {
    const { result, loggerMock } = await invokeFlow(testHubSpotIntegration, {
      configVars: { 
        "HubSpot OAuth Connection": hubspotConnection,
        "Lead Source": "Knowledge GPT Search",
        "Enable Behavioral Analytics": "true",
        "Debug Mode": "true",
      },
    });

    // Verify the flow executes without throwing errors
    expect(result?.data).toBeDefined();
    expect(loggerMock.info).toHaveBeenCalledWith("Starting HubSpot integration test with sample data");
  });
});
